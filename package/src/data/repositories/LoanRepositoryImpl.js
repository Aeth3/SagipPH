import { LoanRepository } from "../../domain/repositories/LoanRepository";
import { requestOfflineFirst } from "../../infra/http/offlineHttp";
import { Loan } from "../../domain/entities/Loan";

const BASE = "/loans";

/** Convert camelCase keys to snake_case for the DB layer. */
const toSnakeCase = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
            k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`),
            v,
        ])
    );
};

export class LoanRepositoryImpl extends LoanRepository {
    async getLoans() {
        const res = await requestOfflineFirst({ method: "GET", url: BASE }, { cacheReads: true });

        // Handle normal array responses or offline-cached arrays (which may be
        // returned as an object due to offlineHttp spreading). Normalize to array.
        let items = [];
        if (Array.isArray(res)) items = res;
        else if (res && typeof res === "object") {
            // cached arrays may be returned as an object with numeric keys and a
            // length property (offlineHttp spreads arrays). Recover the array.
            if (typeof res.length === "number" && res.length >= 0) {
                items = Array.from({ length: res.length }, (_, i) => res[i]);
            }
        }

        return items.map((r) => Loan.fromDTO(r));
    }

    async getLoanById(id) {
        const res = await requestOfflineFirst({ method: "GET", url: `${BASE}?id=eq.${id}` }, { cacheReads: true });
        const row = Array.isArray(res) ? res[0] : res;
        if (!row) return null;
        return Loan.fromDTO(row);
    }

    async createLoan(loanData) {
        const res = await requestOfflineFirst(
            { method: "POST", url: BASE, data: toSnakeCase(loanData) },
            { queueOfflineWrites: true, cacheReads: false }
        );
        // If queued, return the queued metadata so caller can indicate pending state.
        if (res?.queued) return res;
        // Supabase PostgREST returns an array; extract the first element.
        const row = Array.isArray(res) ? res[0] : res;
        return Loan.fromDTO(row);
    }

    async deleteLoan(id) {
        const res = await requestOfflineFirst(
            { method: "DELETE", url: `${BASE}?id=eq.${id}` },
            { queueOfflineWrites: true }
        );
        return res?.queued ? res : { success: true };
    }

    async updateLoan(id, loanData) {
        const res = await requestOfflineFirst(
            { method: "PATCH", url: `${BASE}?id=eq.${id}`, data: toSnakeCase(loanData) },
            { queueOfflineWrites: true, cacheReads: false }
        );
        if (res?.queued) return res;
        const row = Array.isArray(res) ? res[0] : res;
        return Loan.fromDTO(row);
    }
    // mapping handled by `Loan.fromDTO`
}

export const loanRepository = new LoanRepositoryImpl();