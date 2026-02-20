import { normalizePhoneNumber } from '../entities/Phone';
import { fail, ok } from '../shared/result';

export const makeVerifyPhoneNumber = () => {
    return async ({ phone }) => {
        try {
            const normalizedPhone = normalizePhoneNumber(phone);
            if (!normalizedPhone) return fail('VALIDATION_ERROR', 'Invalid phone number format');
            return ok({ phone: normalizedPhone });
        } catch (error) {
            return fail('VALIDATION_ERROR', error?.message || 'Invalid phone number format');
        }
    }
}  