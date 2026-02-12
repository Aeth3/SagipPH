import apiClient from '../../infra/http/apiClient';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { createSession } from '../../domain/entities/Session';
import { createUser } from '../../domain/entities/User';

export class AuthRepositoryApiImpl extends AuthRepository {
    async sendOtp({ phone }) {
        const response = await apiClient.post('/auth/otp/send', { phone });
        // apiClient interceptor already unwraps response.data
        if (!response?.success) {
            throw new Error(response?.message || 'Failed to send OTP');
        }
    }

    async verifyOtp({ phone, code }) {
        const response = await apiClient.post('/auth/otp/verify', { phone, code });

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
}

export const authRepositoryApi = new AuthRepositoryApiImpl();