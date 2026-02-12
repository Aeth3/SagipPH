import { createPhone } from '../entities/Phone';
import { ok, fail } from '../shared/result';

export const makeVerifyOtp = ({ authRepository }) => {
    return async ({ phone, code }) => {
        try {
            const normalizedPhone = createPhone(phone);
            const normalizedCode = typeof code === 'string' ? code.trim() : '';
            if (!normalizedCode) return fail('VALIDATION_ERROR', 'OTP code is required');

            const result = await authRepository.verifyOtp({
                phone: normalizedPhone,
                code: normalizedCode,
            });
            if (!result?.user) return fail('AUTH_ERROR', 'No user returned');
            if (!result?.session) return fail('AUTH_ERROR', 'No session returned');
            return ok(result);
        } catch (error) {
            return fail('AUTH_ERROR', error?.message || 'OTP verification failed');
        }
    };
};