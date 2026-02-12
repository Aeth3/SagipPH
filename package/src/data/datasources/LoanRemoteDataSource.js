/**
 * LoanRemoteDataSource – talks to Supabase (via apiClient) for loan CRUD.
 *
 * This is a thin "dumb" layer with no caching or queueing logic.
 * The sync service decides *when* to call these methods.
 */
import apiClient from "../../infra/http/apiClient";

const BASE = "/loans";

/** snake_case an object's keys (shallow). */
const toSnakeCase = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
            k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`),
            v,
        ])
    );
};

/**
 * Fetch all loans from the remote API.
 * @returns {Promise<object[]>}  array of raw remote rows (snake_case)
 */
export const fetchAllLoans = async () => {
    const response = await apiClient.request({ method: "GET", url: BASE });
    return Array.isArray(response) ? response : [];
};

/**
 * Push a new loan to the remote API.
 * @param {object} data – { borrower, amount, due_date, status, term? }
 * @returns {object} the created row from Supabase (with server `id`).
 */
export const pushLoan = async (data) => {
    const response = await apiClient.request({
        method: "POST",
        url: BASE,
        data: toSnakeCase(data),
    });
    const row = Array.isArray(response) ? response[0] : response;
    return row;
};

/**
 * Update a loan on the remote API.
 * @param {string|number} serverId
 * @param {object} data
 * @returns {object}
 */
export const pushLoanUpdate = async (serverId, data) => {
    const response = await apiClient.request({
        method: "PATCH",
        url: `${BASE}?id=eq.${serverId}`,
        data: toSnakeCase(data),
    });
    const row = Array.isArray(response) ? response[0] : response;
    return row;
};

/**
 * Delete a loan on the remote API.
 */
export const pushLoanDelete = async (serverId) => {
    await apiClient.request({
        method: "DELETE",
        url: `${BASE}?id=eq.${serverId}`,
    });
};
