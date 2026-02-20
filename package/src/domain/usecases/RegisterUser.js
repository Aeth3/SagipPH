import { normalizePhoneNumber } from "../entities/Phone";
import { fail, ok } from "../shared/result";
export const makeRegisterUser = ({ authRepository }) => {
    return async (payload) => {
        try {
            const normalizedPhone = normalizePhoneNumber(payload.phone);

            if (!normalizedPhone) {
                return fail('INVALID_PHONE', 'Invalid Philippine mobile number');
            }

            const sanitizedPayload = {
                ...payload,
                phone: normalizedPhone,
            };

            const result = await authRepository.registerUser(sanitizedPayload);

            if (!result.status) {
                return fail('REGISTRATION_ERROR', result?.message || 'Registration failed');
            }

            return ok(result);

        } catch (error) {
            return fail('REGISTRATION_ERROR', error?.message || 'Registration failed');
        }
    };
};