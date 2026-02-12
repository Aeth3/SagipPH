import { LoanRepository } from "../../domain/repositories/LoanRepository";
import { Loan } from "../../domain/entities/Loan";
import * as localDS from "../datasources/LoanLocalDataSource";
import { syncLoans } from "../../services/LoanSyncService";

/**
 * Offline‑first LoanRepository implementation.
 *
 * ──── Reads  → always from SQLite (instant, works offline)
 * ──── Writes → SQLite first, then trigger background sync to Supabase
 */
export class LoanRepositoryImpl extends LoanRepository {

    /** Fire‑and‑forget sync — errors are swallowed so callers aren't affected. */
    _triggerSync() {
        syncLoans().catch(() => undefined);
    }

    // ── Reads ──────────────────────────────────────────────────────────

    async getLoans() {
        const rows = await localDS.getAllLoans();
        // Kick off a background sync so fresh remote data arrives soon.
        this._triggerSync();
        return rows.map((r) => Loan.fromDTO(r));
    }

    async getLoanById(id) {
        // `id` may be either a local_id or server_id – try both.
        let row = await localDS.getLoanByLocalId(id);
        if (!row) row = await localDS.getLoanByServerId(id);
        if (!row) return null;
        return Loan.fromDTO(row);
    }

    // ── Writes (SQLite first, sync later) ──────────────────────────────

    async createLoan(loanData) {
        const row = await localDS.insertLoan(loanData);
        this._triggerSync();
        return Loan.fromDTO(row);
    }

    async deleteLoan(id) {
        let row = await localDS.getLoanByLocalId(id);
        if (!row) row = await localDS.getLoanByServerId(id);
        if (row) {
            await localDS.deleteLoanByLocalId(row.local_id);
        }
        // TODO: queue a remote delete when sync supports it
        return { success: true };
    }

    async updateLoan(id, loanData) {
        let row = await localDS.getLoanByLocalId(id);
        if (!row) row = await localDS.getLoanByServerId(id);
        if (!row) throw new Error(`Loan ${id} not found`);

        // Mark sync_status back to pending so the change gets pushed.
        const updated = await localDS.updateLoanByLocalId(row.local_id, {
            ...loanData,
            sync_status: "pending",
        });
        this._triggerSync();
        return Loan.fromDTO(updated);
    }
}

export const loanRepository = new LoanRepositoryImpl();