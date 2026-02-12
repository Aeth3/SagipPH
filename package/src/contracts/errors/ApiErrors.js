/**
 * Standardized API Error Specifications
 * These define the contract for all errors coming from external APIs
 */

/**
 * Error code enumeration for API responses
 * @enum {string}
 */
export const ApiErrorCode = {
    // Authentication errors
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
    SESSION_EXPIRED: "SESSION_EXPIRED",
    INVALID_TOKEN: "INVALID_TOKEN",
    UNAUTHORIZED: "UNAUTHORIZED",

    // Validation errors
    INVALID_EMAIL: "INVALID_EMAIL",
    INVALID_PASSWORD: "INVALID_PASSWORD",
    PASSWORD_TOO_SHORT: "PASSWORD_TOO_SHORT",
    VALIDATION_ERROR: "VALIDATION_ERROR",

    // OTP errors
    OTP_EXPIRED: "OTP_EXPIRED",
    OTP_INVALID: "OTP_INVALID",
    RATE_LIMITED: "RATE_LIMITED",

    // Network errors
    NETWORK_ERROR: "NETWORK_ERROR",
    REQUEST_TIMEOUT: "REQUEST_TIMEOUT",
    SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

    // Server errors
    SERVER_ERROR: "SERVER_ERROR",
    NOT_FOUND: "NOT_FOUND",
    CONFLICT: "CONFLICT",

    // Generic errors
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

/**
 * Standardized API Error object
 * @typedef {Object} ApiErrorResponse
 * @property {string} code - Error code from ApiErrorCode
 * @property {string} message - Human-readable error message
 * @property {Object} [details] - Additional error details
 * @property {number} [statusCode] - HTTP status code if applicable
 * @property {*} [originalError] - Original error object from API
 */

/**
 * Normalize HTTP status code to error code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Error code
 */
export const mapHttpStatusToErrorCode = (statusCode) => {
    switch (statusCode) {
        case 400:
            return ApiErrorCode.VALIDATION_ERROR;
        case 401:
            return ApiErrorCode.UNAUTHORIZED;
        case 404:
            return ApiErrorCode.NOT_FOUND;
        case 409:
            return ApiErrorCode.CONFLICT;
        case 429:
            return ApiErrorCode.RATE_LIMITED;
        case 500:
            return ApiErrorCode.SERVER_ERROR;
        case 503:
            return ApiErrorCode.SERVICE_UNAVAILABLE;
        default:
            return ApiErrorCode.UNKNOWN_ERROR;
    }
};

/**
 * Create a standardized API error
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} [options] - Additional options
 * @returns {ApiErrorResponse}
 */
export const createApiError = (code, message, options = {}) => {
    const error = {
        code: code || ApiErrorCode.UNKNOWN_ERROR,
        message: message || "An unknown error occurred",
    };

    if (options.details) {
        error.details = options.details;
    }

    if (options.statusCode) {
        error.statusCode = options.statusCode;
    }

    if (options.originalError) {
        error.originalError = options.originalError;
    }

    return Object.freeze(error);
};

/**
 * Check if error is a network error
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
    if (!error) return false;

    const message = String(error?.message || "").toLowerCase();
    return (
        message.includes("network") ||
        message.includes("fetch") ||
        message.includes("unable to reach") ||
        message.includes("timeout")
    );
};

/**
 * Check if error is a validation error
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
export const isValidationError = (error) => {
    if (!error) return false;

    const message = String(error?.message || "").toLowerCase();
    return (
        message.includes("validation") ||
        message.includes("invalid") ||
        message.includes("required")
    );
};
