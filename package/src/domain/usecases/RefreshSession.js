import { ok, fail } from "../shared/result";
import { createSession } from "../entities/Session";

export const makeRefreshSession = ({ authRepository, sessionRepository }) => {
    return async () => {
        try {
            const refreshToken = await sessionRepository.getRefreshToken();
            if (!refreshToken) {
                return fail("NO_REFRESH_TOKEN", "No refresh token available");
            }

            const tokens = await authRepository.refreshSession(refreshToken);

            // Preserve the existing user from the current session
            const currentSession = await sessionRepository.getSession();
            const user = currentSession?.user ?? undefined;

            const newSession = createSession({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                user,
            });

            await sessionRepository.saveSession(newSession);

            return ok(newSession);
        } catch (error) {
            return fail(
                "REFRESH_SESSION_ERROR",
                error?.message || "Could not refresh session"
            );
        }
    };
};
