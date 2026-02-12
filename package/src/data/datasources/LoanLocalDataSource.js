/**
 * LoanLocalDataSource – CRUD operations against the local SQLite `loans` table.
 *
 * This is the single source of truth for loan data on the device.
 * Every write goes here *first*; syncing to Supabase is handled separately
 * by `LoanSyncService`.
 */
import { executeSql, ensureTable } from "../../infra/database/sqliteAdapter";
import { LOANS_TABLE, LOANS_TABLE_COLUMNS } from "../../infra/database/loanTable";
import { SYNC_STATUSES } from "../../domain/entities/Loan";

/** Generate a v4-style UUID (good enough for local primary keys). */
const uuid = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });

const now = () => new Date().toISOString();

let tableReady = false;

const ensureLoansTable = async () => {
    if (tableReady) return;
    await ensureTable(LOANS_TABLE, LOANS_TABLE_COLUMNS);
    tableReady = true;
};

// ── READ ────────────────────────────────────────────────────────────────

export const getAllLoans = async () => {
    await ensureLoansTable();
    const { rows } = await executeSql(
        `SELECT * FROM ${LOANS_TABLE} ORDER BY created_at DESC`
    );
    return rows;
};

export const getLoanByLocalId = async (localId) => {
    await ensureLoansTable();
    const { rows } = await executeSql(
        `SELECT * FROM ${LOANS_TABLE} WHERE local_id = ?`,
        [localId]
    );
    return rows[0] ?? null;
};

export const getLoanByServerId = async (serverId) => {
    await ensureLoansTable();
    const { rows } = await executeSql(
        `SELECT * FROM ${LOANS_TABLE} WHERE server_id = ?`,
        [serverId]
    );
    return rows[0] ?? null;
};

export const getPendingSyncLoans = async () => {
    await ensureLoansTable();
    const { rows } = await executeSql(
        `SELECT * FROM ${LOANS_TABLE} WHERE sync_status = ?`,
        [SYNC_STATUSES.PENDING]
    );
    return rows;
};

export const getFailedSyncLoans = async () => {
    await ensureLoansTable();
    const { rows } = await executeSql(
        `SELECT * FROM ${LOANS_TABLE} WHERE sync_status = ?`,
        [SYNC_STATUSES.FAILED]
    );
    return rows;
};

// ── WRITE ───────────────────────────────────────────────────────────────

/**
 * Insert a new loan into SQLite.
 * @param {object} data – { borrower, amount, dueDate, status, term? }
 * @returns {object} the full row as stored (snake_case keys)
 */
export const insertLoan = async (data) => {
    await ensureLoansTable();
    const localId = uuid();
    const createdAt = now();
    const updatedAt = createdAt;

    await executeSql(
        `INSERT INTO ${LOANS_TABLE}
       (local_id, borrower, amount, term, due_date, status, sync_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            localId,
            data.borrower,
            data.amount,
            data.term ?? null,
            data.due_date || data.dueDate,
            data.status || "pending",
            SYNC_STATUSES.PENDING,
            createdAt,
            updatedAt,
        ]
    );

    return getLoanByLocalId(localId);
};

/**
 * Update an existing loan by its local_id.
 * Only the supplied keys will be changed.
 */
export const updateLoanByLocalId = async (localId, changes) => {
    await ensureLoansTable();
    const allowed = ["borrower", "amount", "term", "due_date", "status", "sync_status", "sync_error", "server_id"];
    const sets = [];
    const values = [];

    // Normalize camelCase to snake_case for known fields
    const normalized = { ...changes };
    if ("dueDate" in normalized) { normalized.due_date = normalized.dueDate; delete normalized.dueDate; }
    if ("syncStatus" in normalized) { normalized.sync_status = normalized.syncStatus; delete normalized.syncStatus; }
    if ("syncError" in normalized) { normalized.sync_error = normalized.syncError; delete normalized.syncError; }
    if ("serverId" in normalized) { normalized.server_id = normalized.serverId; delete normalized.serverId; }

    for (const key of allowed) {
        if (key in normalized) {
            sets.push(`${key} = ?`);
            values.push(normalized[key]);
        }
    }

    if (sets.length === 0) return getLoanByLocalId(localId);

    sets.push("updated_at = ?");
    values.push(now());
    values.push(localId);

    await executeSql(
        `UPDATE ${LOANS_TABLE} SET ${sets.join(", ")} WHERE local_id = ?`,
        values
    );

    return getLoanByLocalId(localId);
};

/**
 * Mark a loan as synced after successful push to Supabase.
 */
export const markSynced = async (localId, serverId) => {
    return updateLoanByLocalId(localId, {
        server_id: serverId,
        sync_status: SYNC_STATUSES.SYNCED,
        sync_error: null,
    });
};

/**
 * Mark a loan's sync as failed.
 */
export const markSyncFailed = async (localId, errorMessage) => {
    return updateLoanByLocalId(localId, {
        sync_status: SYNC_STATUSES.FAILED,
        sync_error: errorMessage,
    });
};

/**
 * Delete a loan by local_id.
 */
export const deleteLoanByLocalId = async (localId) => {
    await ensureLoansTable();
    const { rowsAffected } = await executeSql(
        `DELETE FROM ${LOANS_TABLE} WHERE local_id = ?`,
        [localId]
    );
    return rowsAffected > 0;
};

/**
 * Upsert a loan coming from the remote server (used during pull‑sync).
 * If a row with the same server_id exists it is updated; otherwise inserted.
 */
export const upsertFromRemote = async (remoteRow) => {
    await ensureLoansTable();
    const serverId = remoteRow.id;
    const existing = await getLoanByServerId(serverId);

    if (existing) {
        return updateLoanByLocalId(existing.local_id, {
            borrower: remoteRow.borrower,
            amount: remoteRow.amount,
            term: remoteRow.term,
            due_date: remoteRow.due_date,
            status: remoteRow.status,
            server_id: serverId,
            sync_status: SYNC_STATUSES.SYNCED,
            sync_error: null,
        });
    }

    // New remote loan not yet in local DB
    const localId = uuid();
    const createdAt = remoteRow.created_at || now();
    const updatedAt = remoteRow.updated_at || now();

    await executeSql(
        `INSERT INTO ${LOANS_TABLE}
       (local_id, server_id, borrower, amount, term, due_date, status, sync_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            localId,
            serverId,
            remoteRow.borrower,
            remoteRow.amount,
            remoteRow.term ?? null,
            remoteRow.due_date,
            remoteRow.status,
            SYNC_STATUSES.SYNCED,
            createdAt,
            updatedAt,
        ]
    );

    return getLoanByLocalId(localId);
};
