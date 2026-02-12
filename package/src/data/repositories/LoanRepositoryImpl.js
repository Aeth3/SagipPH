import { LoanRepository } from "../../domain/repositories/LoanRepository";
import { requestOfflineFirst } from "../../infra/http/offlineHttp";
import { Loan } from "../../domain/entities/Loan";

const BASE = "/loans";

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
        const res = await requestOfflineFirst({ method: "GET", url: `${BASE}/${id}` }, { cacheReads: true });
        if (!res) return null;
        return Loan.fromDTO(res);
    }

    async createLoan(loanData) {
        const res = await requestOfflineFirst(
            { method: "POST", url: BASE, data: loanData },
            { queueOfflineWrites: true, cacheReads: false }
        );
        // If queued, return the queued metadata so caller can indicate pending state.
        if (res?.queued) return res;
        return Loan.fromDTO(res);
    }

    async deleteLoan(id) {
        const res = await requestOfflineFirst(
            { method: "DELETE", url: `${BASE}/${id}` },
            { queueOfflineWrites: true }
        );
        return res?.queued ? res : { success: true };
    }

    async updateLoan(id, loanData) {
        const res = await requestOfflineFirst(
            { method: "PUT", url: `${BASE}/${id}`, data: loanData },
            { queueOfflineWrites: true, cacheReads: false }
        );
        if (res?.queued) return res;
        return Loan.fromDTO(res);
    }
    // mapping handled by `Loan.fromDTO`
}

export const loanRepository = new LoanRepositoryImpl();