import { makeClearSession } from "../../package/src/domain/usecases/ClearSession";
import { makeGetAccessToken } from "../../package/src/domain/usecases/GetAccessToken";
import { makeGetCurrentUser } from "../../package/src/domain/usecases/GetCurrentUser";
import { makeGetSession } from "../../package/src/domain/usecases/GetSession";
import { makeSaveSession } from "../../package/src/domain/usecases/SaveSession";
import { makeSignOut } from "../../package/src/domain/usecases/SignOut";

describe("ClearSession", () => {
    it("returns ok when session cleared successfully", async () => {
        const sessionRepository = { clearSession: jest.fn().mockResolvedValue(undefined) };
        const clearSession = makeClearSession({ sessionRepository });
        const result = await clearSession();
        expect(result).toEqual({ ok: true, value: null, error: null });
        expect(sessionRepository.clearSession).toHaveBeenCalled();
    });

    it("returns fail when clearSession throws", async () => {
        const sessionRepository = {
            clearSession: jest.fn().mockRejectedValue(new Error("storage error")),
        };
        const clearSession = makeClearSession({ sessionRepository });
        const result = await clearSession();
        expect(result.ok).toBe(false);
        expect(result.error.code).toBe("SESSION_ERROR");
        expect(result.error.message).toBe("storage error");
    });
});

describe("GetAccessToken", () => {
    it("returns ok with access token", async () => {
        const sessionRepository = {
            getAccessToken: jest.fn().mockResolvedValue("token-abc"),
        };
        const getAccessToken = makeGetAccessToken({ sessionRepository });
        const result = await getAccessToken();
        expect(result).toEqual({ ok: true, value: "token-abc", error: null });
    });

    it("returns ok with null when no token exists", async () => {
        const sessionRepository = {
            getAccessToken: jest.fn().mockResolvedValue(null),
        };
        const getAccessToken = makeGetAccessToken({ sessionRepository });
        const result = await getAccessToken();
        expect(result).toEqual({ ok: true, value: null, error: null });
    });

    it("returns fail on error", async () => {
        const sessionRepository = {
            getAccessToken: jest.fn().mockRejectedValue(new Error("fail")),
        };
        const getAccessToken = makeGetAccessToken({ sessionRepository });
        const result = await getAccessToken();
        expect(result.ok).toBe(false);
        expect(result.error.code).toBe("GET_ACCESS_TOKEN_ERROR");
    });
});

describe("GetCurrentUser", () => {
    it("returns ok with user", async () => {
        const authRepository = {
            getCurrentUser: jest.fn().mockResolvedValue({ id: "u1" }),
        };
        const getCurrentUser = makeGetCurrentUser({ authRepository });
        const result = await getCurrentUser();
        expect(result).toEqual({ ok: true, value: { id: "u1" }, error: null });
    });

    it("returns ok with null when no user", async () => {
        const authRepository = {
            getCurrentUser: jest.fn().mockResolvedValue(null),
        };
        const getCurrentUser = makeGetCurrentUser({ authRepository });
        const result = await getCurrentUser();
        expect(result).toEqual({ ok: true, value: null, error: null });
    });

    it("returns fail on error", async () => {
        const authRepository = {
            getCurrentUser: jest.fn().mockRejectedValue(new Error("auth fail")),
        };
        const getCurrentUser = makeGetCurrentUser({ authRepository });
        const result = await getCurrentUser();
        expect(result.ok).toBe(false);
        expect(result.error.code).toBe("AUTH_ERROR");
        expect(result.error.message).toBe("auth fail");
    });
});

describe("GetSession", () => {
    it("returns ok with session", async () => {
        const sessionRepository = {
            getSession: jest.fn().mockResolvedValue({ access_token: "tok" }),
        };
        const getSession = makeGetSession({ sessionRepository });
        const result = await getSession();
        expect(result).toEqual({
            ok: true,
            value: { access_token: "tok" },
            error: null,
        });
    });

    it("returns ok with null when no session", async () => {
        const sessionRepository = {
            getSession: jest.fn().mockResolvedValue(null),
        };
        const getSession = makeGetSession({ sessionRepository });
        const result = await getSession();
        expect(result.value).toBeNull();
    });

    it("returns fail on error", async () => {
        const sessionRepository = {
            getSession: jest.fn().mockRejectedValue(new Error("read error")),
        };
        const getSession = makeGetSession({ sessionRepository });
        const result = await getSession();
        expect(result.ok).toBe(false);
        expect(result.error.code).toBe("SESSION_ERROR");
    });
});

describe("SaveSession", () => {
    it("delegates to sessionRepository.saveSession", () => {
        const sessionRepository = {
            saveSession: jest.fn().mockResolvedValue(undefined),
        };
        const saveSession = makeSaveSession({ sessionRepository });
        saveSession({ access_token: "tok" });
        expect(sessionRepository.saveSession).toHaveBeenCalledWith({
            access_token: "tok",
        });
    });

    it("throws when session is null", () => {
        const sessionRepository = { saveSession: jest.fn() };
        const saveSession = makeSaveSession({ sessionRepository });
        expect(() => saveSession(null)).toThrow("Session payload is required");
    });

    it("throws when session is not an object", () => {
        const sessionRepository = { saveSession: jest.fn() };
        const saveSession = makeSaveSession({ sessionRepository });
        expect(() => saveSession("string")).toThrow("Session payload is required");
    });
});

describe("SignOut", () => {
    it("returns ok on successful sign out", async () => {
        const authRepository = {
            signOut: jest.fn().mockResolvedValue(undefined),
        };
        const signOut = makeSignOut({ authRepository });
        const result = await signOut();
        expect(result).toEqual({ ok: true, value: null, error: null });
        expect(authRepository.signOut).toHaveBeenCalled();
    });

    it("returns fail when signOut throws", async () => {
        const authRepository = {
            signOut: jest.fn().mockRejectedValue(new Error("logout failed")),
        };
        const signOut = makeSignOut({ authRepository });
        const result = await signOut();
        expect(result.ok).toBe(false);
        expect(result.error.code).toBe("AUTH_ERROR");
        expect(result.error.message).toBe("logout failed");
    });
});
