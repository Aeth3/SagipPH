/**
 * OTP Auth API Response Contracts
 * Defines expected request/response shapes for OTP endpoints
 */

/**
 * Send OTP request payload
 * @typedef {Object} SendOtpRequest
 * @property {string} phone - PH phone number in 63XXXXXXXXXX format
 */

/**
 * Send OTP success response
 * POST /auth/otp/send
 * @typedef {Object} SendOtpResponse
 * @property {boolean} success - Whether the OTP was sent
 * @property {string} [message] - Optional status message
 */

/**
 * Verify OTP request payload
 * @typedef {Object} VerifyOtpRequest
 * @property {string} phone - PH phone number in 63XXXXXXXXXX format
 * @property {string} code - 6-digit OTP code
 */

/**
 * Verify OTP success response
 * POST /auth/otp/verify
 * @typedef {Object} VerifyOtpResponse
 * @property {string} access_token - JWT access token
 * @property {string} [refresh_token] - Refresh token for renewing session
 * @property {OtpUserResponse} user - Authenticated user data
 */

/**
 * User object returned from OTP verification
 * @typedef {Object} OtpUserResponse
 * @property {string} id - User UUID
 * @property {string} phone - Verified phone number
 * @property {string|null} [email] - User email (optional)
 * @property {string} [first_name] - User first name
 * @property {string} [last_name] - User last name
 */

/**
 * OTP API error response shape
 * @typedef {Object} OtpErrorResponse
 * @property {string} message - Error description
 * @property {string} [code] - Machine-readable error code (e.g. "OTP_EXPIRED", "RATE_LIMITED")
 * @property {number} [retryAfter] - Seconds to wait before retrying (on 429)
 */

// ─── Validators ───────────────────────────────────────────────────────────────

/**
 * Validate the send OTP response shape
 * @param {*} response - Response from /auth/otp/send (after Axios unwrap)
 * @returns {{ valid: boolean, error: string | null }}
 */
export const validateSendOtpResponse = (response) => {
    if (!response || typeof response !== "object") {
        return { valid: false, error: "Response must be an object" };
    }
    if (typeof response.success !== "boolean") {
        return { valid: false, error: "Response must have boolean 'success' field" };
    }
    return { valid: true, error: null };
};

/**
 * Validate the verify OTP response shape
 * @param {*} response - Response from /auth/otp/verify (after Axios unwrap)
 * @returns {{ valid: boolean, error: string | null }}
 */
export const validateVerifyOtpResponse = (response) => {
    if (!response || typeof response !== "object") {
        return { valid: false, error: "Response must be an object" };
    }
    if (typeof response.access_token !== "string" || !response.access_token.trim()) {
        return { valid: false, error: "Response must have non-empty 'access_token' string" };
    }
    if (!response.user || typeof response.user !== "object") {
        return { valid: false, error: "Response must have 'user' object" };
    }
    if (typeof response.user.id !== "string" || !response.user.id.trim()) {
        return { valid: false, error: "Response user must have non-empty 'id' string" };
    }
    return { valid: true, error: null };
};

/**
 * Check if an API error indicates an expired OTP
 * @param {Object} error - Normalized error from Axios interceptor
 * @returns {boolean}
 */
export const isOtpExpiredError = (error) => {
    if (!error) return false;
    const code = String(error?.data?.code || error?.code || "").toUpperCase();
    const message = String(error?.message || "").toLowerCase();
    return code === "OTP_EXPIRED" || message.includes("expired");
};

/**
 * Check if an API error indicates rate limiting
 * @param {Object} error - Normalized error from Axios interceptor
 * @returns {boolean}
 */
export const isRateLimitedError = (error) => {
    if (!error) return false;
    return error?.status === 429;
};

/**
 * Extract retry-after seconds from a rate-limited error
 * @param {Object} error - Normalized error from Axios interceptor
 * @returns {number|null}
 */
export const extractRetryAfter = (error) => {
    if (!error) return null;
    const seconds = Number(error?.data?.retryAfter);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
};
