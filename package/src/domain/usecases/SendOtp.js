import { createPhone } from '../entities/Phone';
import { ok, fail } from '../shared/result';

export const makeSendOtp = ({ authRepository }) => {
    return async ({ phone }) => {
        try {
            const normalizedPhone = createPhone(phone);
            await authRepository.sendOtp({ phone: normalizedPhone });
            return ok(null);
        } catch (error) {
            return fail('AUTH_ERROR', error?.message || 'Failed to send OTP');
        }
    };
};