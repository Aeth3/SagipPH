import { fail, ok } from "../shared/result"
export const makeGetClientToken = ({ authRepository, sessionRepository, name }) => {
    return async () => {
        try {
            const cachedToken = await sessionRepository.getClientToken();
            if (typeof cachedToken === "string") {
                const normalizedCachedToken = cachedToken.trim();
                if (normalizedCachedToken) {
                    return ok({ client_token: normalizedCachedToken });
                }
            }

            const token = await authRepository.getClientToken(name);
            if (!token) {
                return fail('AUTH_ERROR', 'No client token returned from auth provider');
            }

            if (typeof token !== 'string') {
                return fail('AUTH_ERROR', 'Invalid client token format received from auth provider');
            }

            const normalizedToken = token.trim();
            if (!normalizedToken) {
                return fail('AUTH_ERROR', 'Invalid client token format received from auth provider');
            }

            await sessionRepository.saveClientToken(normalizedToken);
            return ok({ client_token: normalizedToken });
        } catch (error) {
            return fail('AUTH_ERROR', error?.message || 'Failed to get client token');
        }

    }
}
