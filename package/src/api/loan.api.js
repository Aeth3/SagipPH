import { requestOfflineFirst } from "../infra/http/offlineHttp";

export const LoanAPI = {
    getLoans: async () => requestOfflineFirst({
        method: "GET",
        url: "/loans",
    }),
}