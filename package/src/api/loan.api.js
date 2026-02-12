import { requestOfflineFirst } from "../infra/http/offlineHttp";

const BASE = "/loans";

export const LoanAPI = {
    getLoans: async () => requestOfflineFirst({
        method: "GET",
        url: BASE,
    }),
    createLoan: async (data) => requestOfflineFirst(
        { method: "POST", url: BASE, data },
        { queueOfflineWrites: true, cacheReads: false }
    ),
    updateLoan: async (id, data) => requestOfflineFirst(
        { method: "PATCH", url: `${BASE}?id=eq.${id}`, data },
        { queueOfflineWrites: true, cacheReads: false }
    ),
    deleteLoan: async (id) => requestOfflineFirst(
        { method: "DELETE", url: `${BASE}?id=eq.${id}` },
        { queueOfflineWrites: true }
    ),
};