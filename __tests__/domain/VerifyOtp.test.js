import { makeVerifyOtp } from "../../package/src/domain/usecases/VerifyOtp";

describe("makeVerifyOtp", () => {
    const mockUser = { id: "u1", phone: "+639171234567" };
    const mockSession = { access_token: "tok123" };

    it("calls repository.verifyOtp and returns ok with user/session", async () => {
        const authRepository = {
            verifyOtp: jest.fn().mockResolvedValue({
                user: mockUser,
                session: mockSession,
            }),
        };
        const verifyOtp = makeVerifyOtp({ authRepository });

        const result = await verifyOtp({ phone: "+639171234567", code: "123456" });

        expect(authRepository.verifyOtp).toHaveBeenCalledWith({
            phone: "+639171234567",
            code: "123456",
        });
        expect(result.ok).toBe(true);
        expect(result.value.user).toEqual(mockUser);
        expect(result.value.session).toEqual(mockSession);
    });

    it("returns fail when code is empty", async () => {
        const authRepository = { verifyOtp: jest.fn() };
        const verifyOtp = makeVerifyOtp({ authRepository });

        const result = await verifyOtp({ phone: "+639171234567", code: "" });

        expect(authRepository.verifyOtp).not.toHaveBeenCalled();
        expect(result.ok).toBe(false);
        expect(result.error).toEqual({
            code: "VALIDATION_ERROR",
            message: "OTP code is required",
        });
    });

    it("returns fail when code is not a string", async () => {
        const authRepository = { verifyOtp: jest.fn() };
        const verifyOtp = makeVerifyOtp({ authRepository });

        const result = await verifyOtp({ phone: "+639171234567", code: null });

        expect(result.ok).toBe(false);
        expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns fail when phone is invalid", async () => {
        const authRepository = { verifyOtp: jest.fn() };
        const verifyOtp = makeVerifyOtp({ authRepository });

        const result = await verifyOtp({ phone: "bad-phone", code: "123456" });

        expect(authRepository.verifyOtp).not.toHaveBeenCalled();
        expect(result.ok).toBe(false);
        expect(result.error.code).toBe("AUTH_ERROR");
    });

    it("returns fail when repository returns no user", async () => {
        const authRepository = {
            verifyOtp: jest.fn().mockResolvedValue({
                user: null,
                session: mockSession,
            }),
        };
        const verifyOtp = makeVerifyOtp({ authRepository });

        const result = await verifyOtp({ phone: "+639171234567", code: "123456" });

        expect(result.ok).toBe(false);
        expect(result.error).toEqual({
            code: "AUTH_ERROR",
            message: "No user returned",
        });
    });

    it("returns fail when repository returns no session", async () => {
        const authRepository = {
            verifyOtp: jest.fn().mockResolvedValue({
                user: mockUser,
                session: null,
            }),
        };
        const verifyOtp = makeVerifyOtp({ authRepository });

        const result = await verifyOtp({ phone: "+639171234567", code: "123456" });

        expect(result.ok).toBe(false);
        expect(result.error).toEqual({
            code: "AUTH_ERROR",
            message: "No session returned",
        });
    });

    it("returns fail when repository throws", async () => {
        const authRepository = {
            verifyOtp: jest.fn().mockRejectedValue(new Error("Invalid code")),
        };
        const verifyOtp = makeVerifyOtp({ authRepository });

        const result = await verifyOtp({ phone: "+639171234567", code: "999999" });

        expect(result.ok).toBe(false);
        expect(result.error).toEqual({
            code: "AUTH_ERROR",
            message: "Invalid code",
        });
    });

    it("trims code whitespace", async () => {
        const authRepository = {
            verifyOtp: jest.fn().mockResolvedValue({
                user: mockUser,
                session: mockSession,
            }),
        };
        const verifyOtp = makeVerifyOtp({ authRepository });

        await verifyOtp({ phone: "+639171234567", code: "  123456  " });

        expect(authRepository.verifyOtp).toHaveBeenCalledWith({
            phone: "+639171234567",
            code: "123456",
        });
    });
});
