jest.mock("../../package/src/composition/authSession", () => ({
    clearSession: jest.fn(),
    getAccessToken: jest.fn(),
    getSession: jest.fn(),
    saveSession: jest.fn(),
}));

const authSession = require("../../package/src/composition/authSession");
const {
    saveSession,
    getSession,
    getSessionToken,
    clearSession,
} = require("../../package/services/storageService");

describe("storageService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe("saveSession", () => {
        it("delegates to saveSessionUseCase", async () => {
            authSession.saveSession.mockResolvedValue(undefined);
            await saveSession({ access_token: "tok" });
            expect(authSession.saveSession).toHaveBeenCalledWith({
                access_token: "tok",
            });
        });

        it("does not throw on error", async () => {
            authSession.saveSession.mockRejectedValue(new Error("fail"));
            await expect(saveSession({})).resolves.toBeUndefined();
        });
    });

    describe("getSession", () => {
        it("returns session value when ok", async () => {
            authSession.getSession.mockResolvedValue({
                ok: true,
                value: { access_token: "tok" },
            });
            const result = await getSession();
            expect(result).toEqual({ access_token: "tok" });
        });

        it("returns null when not ok", async () => {
            authSession.getSession.mockResolvedValue({
                ok: false,
                error: { message: "err" },
            });
            const result = await getSession();
            expect(result).toBeNull();
        });

        it("returns null on error", async () => {
            authSession.getSession.mockRejectedValue(new Error("fail"));
            const result = await getSession();
            expect(result).toBeNull();
        });
    });

    describe("getSessionToken", () => {
        it("returns token from getAccessToken", async () => {
            authSession.getAccessToken.mockResolvedValue("tok123");
            const result = await getSessionToken();
            expect(result).toBe("tok123");
        });

        it("returns null on error", async () => {
            authSession.getAccessToken.mockRejectedValue(new Error("fail"));
            const result = await getSessionToken();
            expect(result).toBeNull();
        });
    });

    describe("clearSession", () => {
        it("delegates to clearSessionUseCase", async () => {
            authSession.clearSession.mockResolvedValue(undefined);
            await clearSession();
            expect(authSession.clearSession).toHaveBeenCalled();
        });

        it("does not throw on error", async () => {
            authSession.clearSession.mockRejectedValue(new Error("fail"));
            await expect(clearSession()).resolves.toBeUndefined();
        });
    });
});
