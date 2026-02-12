/**
 * LoanSyncService – orchestrates push & pull synchronisation between
 * the local SQLite database and the remote Supabase API.
 *
 * ──── Push (local → remote) ────────────────────────────────────────────
 * Takes every loan with `sync_status = 'pending'` from SQLite, sends it
 * to Supabase, then marks the row as `synced` (or `failed`).
 *
 * ──── Pull (remote → local) ────────────────────────────────────────────
 * Fetches all loans from Supabase and upserts them into SQLite so the
 * local DB stays up‑to‑date with changes made on other devices.
 *
 * Both operations are safe to call at any time — they are idempotent and
 * guard against concurrent runs with a simple lock flag.
 */

import * as local from "../data/datasources/LoanLocalDataSource";
import * as remote from "../data/datasources/LoanRemoteDataSource";
import { getIsOnline } from "../infra/network/networkMonitor";

let isSyncing = false;

// ── Push ────────────────────────────────────────────────────────────────

/**
 * Push all locally‑created / modified loans that haven't been synced yet.
 * @returns {{ pushed: number, failed: number }}
 */
export const pushPendingLoans = async () => {
    if (!getIsOnline()) return { pushed: 0, failed: 0 };

    const pending = await local.getPendingSyncLoans();
    let pushed = 0;
    let failed = 0;

    for (const row of pending) {
        try {
            const remoteRow = await remote.pushLoan({
                borrower: row.borrower,
                amount: row.amount,
                term: row.term,
                due_date: row.due_date,
                status: row.status,
            });

            const serverId = remoteRow?.id ?? remoteRow?.server_id;
            if (serverId) {
                await local.markSynced(row.local_id, String(serverId));
                pushed += 1;
            } else {
                await local.markSyncFailed(row.local_id, "Remote did not return an id");
                failed += 1;
            }
        } catch (error) {
            const message = error?.message || "Unknown sync error";

            // Network‑like errors → leave as pending for next attempt
            const status = error?.status ?? error?.response?.status;
            const isNetwork = !status || String(message).toLowerCase().includes("network");

            if (isNetwork) {
                // Don't mark as failed — will retry next time
                failed += 1;
                continue;
            }

            // Permanent failure (4xx) — mark so user can see/fix
            await local.markSyncFailed(row.local_id, message);
            failed += 1;
        }
    }

    return { pushed, failed };
};

// ── Pull ────────────────────────────────────────────────────────────────

/**
 * Pull all loans from Supabase and upsert into the local SQLite DB.
 * @returns {{ upserted: number }}
 */
export const pullRemoteLoans = async () => {
    if (!getIsOnline()) return { upserted: 0 };

    const remoteRows = await remote.fetchAllLoans();
    let upserted = 0;

    for (const row of remoteRows) {
        await local.upsertFromRemote(row);
        upserted += 1;
    }

    return { upserted };
};

// ── Full sync (push then pull) ──────────────────────────────────────────

/**
 * Run a full bidirectional sync.  Safe to call frequently — concurrent
 * invocations are no‑ops.
 */
export const syncLoans = async () => {
    if (isSyncing) return { skipped: true };

    isSyncing = true;
    try {
        const pushResult = await pushPendingLoans();
        const pullResult = await pullRemoteLoans();
        return { ...pushResult, ...pullResult, skipped: false };
    } finally {
        isSyncing = false;
    }
};
