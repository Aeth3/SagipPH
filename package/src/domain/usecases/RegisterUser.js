import { fail, ok } from "../shared/result";
export const makeRegisterUser = ({ authRepository }) => {
    return async (payload) => {
        try {
            const result = await authRepository.registerUser(payload);
            if (!result.status) {
                return fail('REGISTRATION_ERROR', result?.message || 'Registration failed');
            }
            return ok(result);
        }
        catch (error) {
            return fail('REGISTRATION_ERROR', error?.message || 'Registration failed');
        }
    }
}
