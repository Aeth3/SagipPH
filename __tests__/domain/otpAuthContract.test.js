import {
    validateSendOtpResponse,
    validateVerifyOtpResponse,
    isOtpExpiredError,
    isRateLimitedError,
    extractRetryAfter,
} from "../../package/src/contracts/api/otpAuth.contract";

describe("OTP Auth Contract Validators", () => {
    describe("validateSendOtpResponse", () => {
        it("returns valid for correct shape", () => {
            expect(validateSendOtpResponse({ success: true })).toEqual({
                valid: true,
                error: null,
            });
        });

        it("returns valid when success is false", () => {
            expect(
                validateSendOtpResponse({ success: false, message: "Rate limited" })
            ).toEqual({ valid: true, error: null });
        });

        it("rejects null", () => {
            expect(validateSendOtpResponse(null).valid).toBe(false);
        });

        it("rejects missing success field", () => {
            const result = validateSendOtpResponse({ message: "ok" });
            expect(result.valid).toBe(false);
            expect(result.error).toContain("success");
        });

        it("rejects non-boolean success", () => {
            expect(validateSendOtpResponse({ success: "yes" }).valid).toBe(false);
        });
    });

    describe("validateVerifyOtpResponse", () => {
        const validResponse = {
            access_token: "jwt-token",
            refresh_token: "refresh",
            user: { id: "u1", phone: "+639171234567" },
        };

        it("returns valid for correct shape", () => {
            expect(validateVerifyOtpResponse(validResponse)).toEqual({
                valid: true,
                error: null,
            });
        });

        it("rejects null", () => {
            expect(validateVerifyOtpResponse(null).valid).toBe(false);
        });

        it("rejects missing access_token", () => {
            const result = validateVerifyOtpResponse({
                ...validResponse,
                access_token: undefined,
            });
            expect(result.valid).toBe(false);
            expect(result.error).toContain("access_token");
        });

        it("rejects empty access_token", () => {
            const result = validateVerifyOtpResponse({
                ...validResponse,
                access_token: "  ",
            });
            expect(result.valid).toBe(false);
        });

        it("rejects missing user", () => {
            const result = validateVerifyOtpResponse({
                access_token: "tok",
                user: null,
            });
            expect(result.valid).toBe(false);
            expect(result.error).toContain("user");
        });

        it("rejects user without id", () => {
            const result = validateVerifyOtpResponse({
                access_token: "tok",
                user: { phone: "+639171234567" },
            });
            expect(result.valid).toBe(false);
            expect(result.error).toContain("id");
        });
    });

    describe("isOtpExpiredError", () => {
        it("detects OTP_EXPIRED code in data", () => {
            expect(isOtpExpiredError({ data: { code: "OTP_EXPIRED" } })).toBe(true);
        });

        it("detects expired keyword in message", () => {
            expect(
                isOtpExpiredError({ message: "Your OTP has expired" })
            ).toBe(true);
        });

        it("returns false for unrelated error", () => {
            expect(isOtpExpiredError({ message: "Invalid code" })).toBe(false);
        });

        it("returns false for null", () => {
            expect(isOtpExpiredError(null)).toBe(false);
        });
    });

    describe("isRateLimitedError", () => {
        it("detects status 429", () => {
            expect(isRateLimitedError({ status: 429 })).toBe(true);
        });

        it("returns false for other status codes", () => {
            expect(isRateLimitedError({ status: 400 })).toBe(false);
        });

        it("returns false for null", () => {
            expect(isRateLimitedError(null)).toBe(false);
        });
    });

    describe("extractRetryAfter", () => {
        it("extracts retryAfter seconds from data", () => {
            expect(extractRetryAfter({ data: { retryAfter: 60 } })).toBe(60);
        });

        it("returns null when not present", () => {
            expect(extractRetryAfter({ data: {} })).toBeNull();
        });

        it("returns null for non-positive values", () => {
            expect(extractRetryAfter({ data: { retryAfter: 0 } })).toBeNull();
            expect(extractRetryAfter({ data: { retryAfter: -5 } })).toBeNull();
        });

        it("returns null for null error", () => {
            expect(extractRetryAfter(null)).toBeNull();
        });
    });
});
