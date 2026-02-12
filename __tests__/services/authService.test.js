jest.mock("../../package/src/composition/authSession", () => ({
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
}));

const {
    signInWithPassword,
    signOut: signOutUsecase,
    signUp: signUpUsecase,
} = require("../../package/src/composition/authSession");
const { signin, signup, signout } = require("../../package/services/authService");

describe("authService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "log").mockImplementation(() => { });
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe("signin", () => {
        it("returns success with data on ok result", async () => {
            signInWithPassword.mockResolvedValue({
                ok: true,
                value: { user: { id: "u1" }, session: { access_token: "tok" } },
            });
            const result = await signin({ email: "a@b.com", password: "pass" });
            expect(signInWithPassword).toHaveBeenCalledWith({
                email: "a@b.com",
                password: "pass",
            });
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });

        it("returns failure when result is not ok", async () => {
            signInWithPassword.mockResolvedValue({
                ok: false,
                error: { message: "Invalid credentials" },
            });
            const result = await signin({ email: "a@b.com", password: "bad" });
            expect(result).toEqual({
                success: false,
                error: "Invalid credentials",
            });
        });

        it("returns failure when usecase throws", async () => {
            signInWithPassword.mockRejectedValue(new Error("Network"));
            const result = await signin({ email: "a@b.com", password: "pass" });
            expect(result).toEqual({ success: false, error: "Network" });
        });
    });

    describe("signup", () => {
        it("returns success on ok result", async () => {
            signUpUsecase.mockResolvedValue({ ok: true, value: { id: "u1" } });
            const result = await signup({
                email: "a@b.com",
                password: "pass",
                first_name: "A",
                last_name: "B",
            });
            expect(result.success).toBe(true);
        });

        it("returns failure when result is not ok", async () => {
            signUpUsecase.mockResolvedValue({
                ok: false,
                error: { message: "Already exists" },
            });
            const result = await signup({
                email: "a@b.com",
                password: "pass",
                first_name: "A",
                last_name: "B",
            });
            expect(result).toEqual({ success: false, error: "Already exists" });
        });
    });

    describe("signout", () => {
        it("returns success on ok result", async () => {
            signOutUsecase.mockResolvedValue({ ok: true });
            const result = await signout();
            expect(result).toEqual({ success: true });
        });

        it("returns failure on error", async () => {
            signOutUsecase.mockRejectedValue(new Error("Logout fail"));
            const result = await signout();
            expect(result).toEqual({ success: false, error: "Logout fail" });
        });
    });
});
