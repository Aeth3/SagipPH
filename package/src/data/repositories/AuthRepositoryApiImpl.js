import apiClient from '../../infra/http/apiClient';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { createSession } from '../../domain/entities/Session';
import { createUser } from '../../domain/entities/User';
import {
    validateSendOtpResponse,
    validateVerifyOtpResponse,
    isOtpExpiredError,
    isRateLimitedError,
} from '../../contracts/api/otpAuth.contract';
import { generateDateTimeId } from 'package/lib/helpers';

const classifyOtpError = (error) => {
    if (isRateLimitedError(error)) {
        throw new Error('Too many attempts. Please wait before trying again.');
    }
    if (isOtpExpiredError(error)) {
        throw new Error('OTP code has expired. Please request a new code.');
    }
    throw new Error(error?.message || 'Network error');
};

const unwrapPayload = (response) => {
    if (!response || typeof response !== 'object') return response;

    // Keep API envelope objects intact (e.g. {status, message, data})
    if (
        typeof response.status === 'boolean' ||
        typeof response.success === 'boolean' ||
        typeof response.message === 'string' ||
        response.access_token ||
        response.user ||
        response.session
    ) {
        return response;
    }

    if (response.data && typeof response.data === 'object') {
        return response.data;
    }

    return response;
};

const readSuccessFlag = (payload) => {
    if (typeof payload?.success === 'boolean') return payload.success;
    if (typeof payload?.status === 'boolean') return payload.status;
    return undefined;
};

const pickBody = (payload) => {
    if (payload?.data && typeof payload.data === 'object') {
        return payload.data;
    }
    return payload;
};

const normalizeVerifyPayload = (payload) => {
    const body = pickBody(payload);
    const session = body?.session && typeof body.session === 'object' ? body.session : null;
    const user = body?.user || session?.user;
    return {
        access_token:
            body?.access_token ||
            body?.accessToken ||
            body?.token ||
            session?.access_token ||
            session?.accessToken,
        refresh_token:
            body?.refresh_token ||
            body?.refreshToken ||
            session?.refresh_token ||
            session?.refreshToken,
        user,
    };
};

const toFormData = (fields) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, String(value));
        }
    });
    return formData;
};

export class AuthRepositoryApiImpl extends AuthRepository {
    async sendOtp({ phone }) {
        let response;
        try {
            response = await apiClient.post('/api/v1/auth/otp/send', { phone });
        } catch (error) {
            classifyOtpError(error);
        }

        const payload = unwrapPayload(response);
        const success = readSuccessFlag(payload);

        if (success === false) {
            throw new Error(payload?.message || response?.message || 'Failed to send OTP');
        }

        if (success === undefined) {
            const body = pickBody(payload);
            const validation = validateSendOtpResponse(body);
            if (!validation.valid) {
                throw new Error(payload?.message || response?.message || validation.error);
            }
            if (!body.success) {
                throw new Error(payload?.message || 'Failed to send OTP');
            }
        }
    }

    async verifyOtp({ phone, code }) {
        let response;
        try {
            response = await apiClient.post('/api/v1/auth/otp/verify', { phone, code });
        } catch (error) {
            classifyOtpError(error);
        }

        const payload = unwrapPayload(response);
        const success = readSuccessFlag(payload);

        if (success === false) {
            throw new Error(payload?.message || response?.message || 'Verification failed');
        }

        const normalized = normalizeVerifyPayload(payload);
        const validation = validateVerifyOtpResponse(normalized);
        if (!validation.valid) {
            throw new Error(payload?.message || response?.message || validation.error);
        }

        const user = createUser({
            id: String(normalized.user.id),
            email: normalized.user.email || null,
            phone: normalized.user.phone,
            first_name: normalized.user.first_name,
            last_name: normalized.user.last_name,
            raw_user_meta_data: normalized.user,
        });

        const session = createSession({
            access_token: normalized.access_token,
            refresh_token: normalized.refresh_token,
            user,
        });

        return { user, session };
    }

    async signOut() {
        await apiClient.post('/api/v1/auth/logout');
    }

    async getCurrentUser() {
        const response = await apiClient.get('/api/v1/auth/me');
        const payload = unwrapPayload(response);
        const body = pickBody(payload);
        if (!body?.user) return null;

        return createUser({
            id: String(body.user.id),
            email: body.user.email || null,
            phone: body.user.phone,
            first_name: body.user.first_name,
            last_name: body.user.last_name,
            raw_user_meta_data: body.user,
        });
    }

    async signInWithPassword() { throw new Error('Not used in phone auth'); }
    async signUp() { throw new Error('Not used in phone auth'); }
    async requestPasswordReset() { throw new Error('Not used in phone auth'); }
    async verifyRecoveryCode() { throw new Error('Not used in phone auth'); }
    async updatePassword() { throw new Error('Not used in phone auth'); }

    async refreshSession(refreshToken) {
        const response = await apiClient.post('/api/v1/auth/refresh', null, {
            headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const payload = unwrapPayload(response);
        const body = pickBody(payload);

        if (!body?.access_token) {
            throw new Error(payload?.message || 'Token refresh failed');
        }

        return {
            access_token: body.access_token,
            refresh_token: body.refresh_token,
        };
    }

    async getClientToken(name) {
        const response = await apiClient.post('/api/v1/client/register', { name });
        console.log("getClientToken response", response);
        
        const clientToken = response?.data?.client_token ?? response?.client_token;
        if (typeof clientToken !== 'string') {
            throw new Error(response?.message || 'Failed to get client token');
        }
        return clientToken;
    }

    async registerUser(user) {
        const email = user?.email ?? user?.phone;
        const password = user?.password ?? user?.code;
        const name = user?.name || generateDateTimeId(user);
        const permission = user?.permission || 'mobile';

        if (!email) {
            throw new Error('Email is required');
        }
        if (!password) {
            throw new Error('Password is required');
        }

        const formData = toFormData({
            password,
            name,
            email,
            permission,
        });

        const response = await apiClient.post('/api/v1/auth/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        const payload = unwrapPayload(response);
        const success = readSuccessFlag(payload);

        if (success === false) {
            throw new Error(payload?.message || 'Failed to register user');
        }

        if (success === undefined) {
            throw new Error(payload?.message || 'Invalid register response');
        }

        return payload;
    }

    async loginUser(credentials) {
        const response = await apiClient.post('/api/v1/auth/login', credentials);
        const payload = unwrapPayload(response);
        const success = readSuccessFlag(payload);

        if (success === false) {
            throw new Error(payload?.message || 'Failed to login user');
        }

        return payload;
    }
}

