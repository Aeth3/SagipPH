import { ok, fail } from "../shared/result";
export const makeLoginUser = ({ authRepository }) => {
    return async (payload) => {
        try {
            const result = await authRepository.loginUser(payload);
            if (!result.status) {
                return fail('LOGIN_ERROR', result?.message || 'Login failed');
            }
            return ok(result);
        }
        catch (error) {
            return fail('LOGIN_ERROR', error?.message || 'Login failed');
        }
    }
}