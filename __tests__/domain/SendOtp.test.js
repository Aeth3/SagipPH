import { makeSendOtp } from "../../package/src/domain/usecases/SendOtp";

describe("makeSendOtp", () => {
    it("calls repository.sendOtp with normalized phone and returns ok", async () => {
        const authRepository = {
            sendOtp: jest.fn().mockResolvedValue(undefined),
        };
        const sendOtp = makeSendOtp({ authRepository });

        const result = await sendOtp({ phone: "  +639171234567  " });

        expect(authRepository.sendOtp).toHaveBeenCalledWith({
            phone: "+639171234567",
        });
        expect(result).toEqual({ ok: true, value: null, error: null });
    });

    it("returns fail when phone is invalid", async () => {
        const authRepository = { sendOtp: jest.fn() };
        const sendOtp = makeSendOtp({ authRepository });

        const result = await sendOtp({ phone: "09171234567" });

        expect(authRepository.sendOtp).not.toHaveBeenCalled();
        expect(result.ok).toBe(false);
        expect(result.error.code).toBe("AUTH_ERROR");
        expect(result.error.message).toContain("Invalid PH phone number");
    });

    it("returns fail when phone is empty", async () => {
        const authRepository = { sendOtp: jest.fn() };
        const sendOtp = makeSendOtp({ authRepository });

        const result = await sendOtp({ phone: "" });

        expect(result.ok).toBe(false);
        expect(result.error.message).toContain("Phone number is required");
    });

    it("returns fail when repository throws", async () => {
        const authRepository = {
            sendOtp: jest.fn().mockRejectedValue(new Error("Server error")),
        };
        const sendOtp = makeSendOtp({ authRepository });

        const result = await sendOtp({ phone: "+639171234567" });

        expect(result.ok).toBe(false);
        expect(result.error).toEqual({
            code: "AUTH_ERROR",
            message: "Server error",
        });
    });
});
