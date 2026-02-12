import { makeRefreshSession } from "../../package/src/domain/usecases/RefreshSession";

describe("RefreshSession", () => {
    const mockUser = Object.freeze({
        id: "user-1",
        phone: "+639123456789",
        email: null,
        first_name: "Juan",
        last_name: "Dela Cruz",
    });

    const existingSession = {
        access_token: "old-access-token",
        refresh_token: "old-refresh-token",
        user: mockUser,
    };

    it("returns ok with new session when refresh succeeds", async () => {
        const authRepository = {
            refreshSession: jest.fn().mockResolvedValue({
                access_token: "new-access-token",
                refresh_token: "new-refresh-token",
            }),
        };
        const sessionRepository = {
            getRefreshToken: jest.fn().mockResolvedValue("old-refresh-token"),
            getSession: jest.fn().mockResolvedValue(existingSession),
            saveSession: jest.fn().mockResolvedValue(undefined),
        };

        const refreshSession = makeRefreshSession({ authRepository, sessionRepository });
        const result = await refreshSession();

        expect(result.ok).toBe(true);
        expect(result.value.access_token).toBe("new-access-token");
        expect(result.value.refresh_token).toBe("new-refresh-token");
        expect(result.value.user).toEqual(expect.objectContaining({
            id: "user-1",
            phone: "+639123456789",
            first_name: "Juan",
            last_name: "Dela Cruz",
        }));
        expect(authRepository.refreshSession).toHaveBeenCalledWith("old-refresh-token");
        expect(sessionRepository.saveSession).toHaveBeenCalledWith(
            expect.objectContaining({ access_token: "new-access-token" })
        );
    });

    it("returns fail when no refresh token is available", async () => {
        const authRepository = { refreshSession: jest.fn() };
        const sessionRepository = {
            getRefreshToken: jest.fn().mockResolvedValue(null),
        };

        const refreshSession = makeRefreshSession({ authRepository, sessionRepository });
        const result = await refreshSession();

        expect(result.ok).toBe(false);
        expect(result.error.code).toBe("NO_REFRESH_TOKEN");
        expect(authRepository.refreshSession).not.toHaveBeenCalled();
    });

    it("returns fail when authRepository.refreshSession throws", async () => {
        const authRepository = {
            refreshSession: jest.fn().mockRejectedValue(new Error("server error")),
        };
        const sessionRepository = {
            getRefreshToken: jest.fn().mockResolvedValue("some-refresh-token"),
        };

        const refreshSession = makeRefreshSession({ authRepository, sessionRepository });
        const result = await refreshSession();

        expect(result.ok).toBe(false);
        expect(result.error.code).toBe("REFRESH_SESSION_ERROR");
        expect(result.error.message).toBe("server error");
    });

    it("preserves existing user in the refreshed session", async () => {
        const authRepository = {
            refreshSession: jest.fn().mockResolvedValue({
                access_token: "new-token",
                refresh_token: "new-refresh",
            }),
        };
        const sessionRepository = {
            getRefreshToken: jest.fn().mockResolvedValue("old-refresh"),
            getSession: jest.fn().mockResolvedValue(existingSession),
            saveSession: jest.fn().mockResolvedValue(undefined),
        };

        const refreshSession = makeRefreshSession({ authRepository, sessionRepository });
        const result = await refreshSession();

        expect(result.ok).toBe(true);
        expect(result.value.user).toEqual(expect.objectContaining({
            id: "user-1",
            phone: "+639123456789",
            first_name: "Juan",
            last_name: "Dela Cruz",
        }));
    });
});
