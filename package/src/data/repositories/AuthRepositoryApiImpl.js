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

const classifyOtpError = (error) => {
    if (isRateLimitedError(error)) {
        throw new Error('Too many attempts. Please wait before trying again.');
    }
    if (isOtpExpiredError(error)) {
        throw new Error('OTP code has expired. Please request a new code.');
    }
    throw new Error(error?.message || 'Network error');
};

export class AuthRepositoryApiImpl extends AuthRepository {
    async sendOtp({ phone }) {
        let response;
        try {
            response = await apiClient.post('/auth/otp/send', { phone });
        } catch (error) {
            classifyOtpError(error);
        }
        const validation = validateSendOtpResponse(response);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        if (!response.success) {
            throw new Error(response?.message || 'Failed to send OTP');
        }
    }

    async verifyOtp({ phone, code }) {
        let response;
        try {
            response = await apiClient.post('/auth/otp/verify', { phone, code });
        } catch (error) {
            classifyOtpError(error);
        }

        const validation = validateVerifyOtpResponse(response);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const user = createUser({
            id: response.user.id,
            email: response.user.email || null,
            phone: response.user.phone,
            first_name: response.user.first_name,
            last_name: response.user.last_name,
            raw_user_meta_data: response.user,
        });

        const session = createSession({
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            user,
        });

        return { user, session };
    }

    async signOut() {
        await apiClient.post('/auth/logout');
    }

    async getCurrentUser() {
        const response = await apiClient.get('/auth/me');
        if (!response?.user) return null;

        return createUser({
            id: response.user.id,
            email: response.user.email || null,
            phone: response.user.phone,
            first_name: response.user.first_name,
            last_name: response.user.last_name,
            raw_user_meta_data: response.user,
        });
    }

    // These can remain unimplemented or mapped to your API if needed later
    async signInWithPassword() { throw new Error('Not used in phone auth'); }
    async signUp() { throw new Error('Not used in phone auth'); }
    async requestPasswordReset() { throw new Error('Not used in phone auth'); }
    async verifyRecoveryCode() { throw new Error('Not used in phone auth'); }
    async updatePassword() { throw new Error('Not used in phone auth'); }

    async refreshSession(refreshToken) {
        const response = await apiClient.post('/auth/refresh', null, {
            headers: { Authorization: `Bearer ${refreshToken}` },
        });

        if (!response?.access_token) {
            throw new Error(response?.message || 'Token refresh failed');
        }

        return {
            access_token: response.access_token,
            refresh_token: response.refresh_token,
        };
    }
}

export const authRepositoryApi = new AuthRepositoryApiImpl();