/**
 * Tests for LoanLocalDataSource — SQLite CRUD for loans.
 *
 * We mock the sqliteAdapter so we don't need a real SQLite instance.
 */

let mockExecuteSql;
let mockEnsureTable;

beforeEach(() => {
    jest.resetModules();

    mockExecuteSql = jest.fn();
    mockEnsureTable = jest.fn().mockResolvedValue(undefined);

    jest.doMock(
        "../../../package/src/infra/database/sqliteAdapter",
        () => ({
            executeSql: mockExecuteSql,
            ensureTable: mockEnsureTable,
        })
    );

    jest.doMock(
        "../../../package/src/infra/database/loanTable",
        () => ({
            LOANS_TABLE: "loans",
            LOANS_TABLE_COLUMNS: "local_id TEXT PRIMARY KEY",
        })
    );
});

const loadModule = () => require("../../../package/src/data/datasources/LoanLocalDataSource");

// ── getAllLoans ──────────────────────────────────────────────────────────

describe("getAllLoans", () => {
    it("returns all rows from the loans table", async () => {
        const rows = [{ local_id: "a" }, { local_id: "b" }];
        mockExecuteSql.mockResolvedValue({ rows });

        const ds = loadModule();
        const result = await ds.getAllLoans();

        expect(mockEnsureTable).toHaveBeenCalledWith("loans", expect.any(String));
        expect(result).toEqual(rows);
    });
});

// ── getLoanByLocalId ────────────────────────────────────────────────────

describe("getLoanByLocalId", () => {
    it("returns the matching row", async () => {
        const row = { local_id: "abc", borrower: "Alice" };
        mockExecuteSql.mockResolvedValue({ rows: [row] });

        const ds = loadModule();
        const result = await ds.getLoanByLocalId("abc");

        expect(result).toEqual(row);
        expect(mockExecuteSql).toHaveBeenCalledWith(
            expect.stringContaining("WHERE local_id"),
            ["abc"]
        );
    });

    it("returns null when not found", async () => {
        mockExecuteSql.mockResolvedValue({ rows: [] });

        const ds = loadModule();
        const result = await ds.getLoanByLocalId("missing");

        expect(result).toBeNull();
    });
});

// ── insertLoan ──────────────────────────────────────────────────────────

describe("insertLoan", () => {
    it("inserts a row and returns it", async () => {
        const inserted = { local_id: "new-id", borrower: "Bob", amount: 1000 };
        // First call = INSERT, second call = SELECT (getLoanByLocalId)
        mockExecuteSql
            .mockResolvedValueOnce({ rows: [], rowsAffected: 1 })
            .mockResolvedValueOnce({ rows: [inserted] });

        const ds = loadModule();
        const result = await ds.insertLoan({
            borrower: "Bob",
            amount: 1000,
            dueDate: "2026-06-01",
            status: "pending",
        });

        expect(result).toEqual(inserted);
        expect(mockExecuteSql).toHaveBeenCalledTimes(2);
        // First call is the INSERT
        expect(mockExecuteSql.mock.calls[0][0]).toContain("INSERT INTO loans");
    });
});

// ── updateLoanByLocalId ─────────────────────────────────────────────────

describe("updateLoanByLocalId", () => {
    it("updates allowed fields", async () => {
        const updated = { local_id: "abc", borrower: "Updated" };
        mockExecuteSql
            .mockResolvedValueOnce({ rows: [], rowsAffected: 1 }) // UPDATE
            .mockResolvedValueOnce({ rows: [updated] }); // SELECT

        const ds = loadModule();
        const result = await ds.updateLoanByLocalId("abc", { borrower: "Updated" });

        expect(result).toEqual(updated);
        expect(mockExecuteSql.mock.calls[0][0]).toContain("UPDATE loans SET");
    });

    it("normalizes camelCase keys to snake_case", async () => {
        const updated = { local_id: "abc", sync_status: "synced" };
        mockExecuteSql
            .mockResolvedValueOnce({ rows: [], rowsAffected: 1 })
            .mockResolvedValueOnce({ rows: [updated] });

        const ds = loadModule();
        await ds.updateLoanByLocalId("abc", { syncStatus: "synced" });

        // The UPDATE statement should use snake_case column name
        expect(mockExecuteSql.mock.calls[0][0]).toContain("sync_status");
    });
});

// ── markSynced ──────────────────────────────────────────────────────────

describe("markSynced", () => {
    it("sets server_id and sync_status to synced", async () => {
        const synced = { local_id: "abc", server_id: "srv-1", sync_status: "synced" };
        mockExecuteSql
            .mockResolvedValueOnce({ rows: [], rowsAffected: 1 })
            .mockResolvedValueOnce({ rows: [synced] });

        const ds = loadModule();
        const result = await ds.markSynced("abc", "srv-1");

        expect(result.server_id).toBe("srv-1");
        expect(result.sync_status).toBe("synced");
    });
});

// ── markSyncFailed ──────────────────────────────────────────────────────

describe("markSyncFailed", () => {
    it("sets sync_status to failed with error message", async () => {
        const failed = { local_id: "abc", sync_status: "failed", sync_error: "timeout" };
        mockExecuteSql
            .mockResolvedValueOnce({ rows: [], rowsAffected: 1 })
            .mockResolvedValueOnce({ rows: [failed] });

        const ds = loadModule();
        const result = await ds.markSyncFailed("abc", "timeout");

        expect(result.sync_status).toBe("failed");
        expect(result.sync_error).toBe("timeout");
    });
});

// ── deleteLoanByLocalId ─────────────────────────────────────────────────

describe("deleteLoanByLocalId", () => {
    it("returns true when a row is deleted", async () => {
        mockExecuteSql.mockResolvedValue({ rows: [], rowsAffected: 1 });

        const ds = loadModule();
        const result = await ds.deleteLoanByLocalId("abc");

        expect(result).toBe(true);
    });

    it("returns false when no row matched", async () => {
        mockExecuteSql.mockResolvedValue({ rows: [], rowsAffected: 0 });

        const ds = loadModule();
        const result = await ds.deleteLoanByLocalId("missing");

        expect(result).toBe(false);
    });
});

// ── getPendingSyncLoans ─────────────────────────────────────────────────

describe("getPendingSyncLoans", () => {
    it("returns only rows with sync_status = pending", async () => {
        const rows = [{ local_id: "a", sync_status: "pending" }];
        mockExecuteSql.mockResolvedValue({ rows });

        const ds = loadModule();
        const result = await ds.getPendingSyncLoans();

        expect(result).toEqual(rows);
        expect(mockExecuteSql).toHaveBeenCalledWith(
            expect.stringContaining("sync_status"),
            ["pending"]
        );
    });
});

// ── upsertFromRemote ────────────────────────────────────────────────────

describe("upsertFromRemote", () => {
    it("updates existing row when server_id matches", async () => {
        const existing = { local_id: "loc-1", server_id: "srv-1" };
        const updated = { ...existing, borrower: "Updated" };

        // getLoanByServerId → found
        mockExecuteSql.mockResolvedValueOnce({ rows: [existing] });
        // updateLoanByLocalId internals
        mockExecuteSql.mockResolvedValueOnce({ rows: [], rowsAffected: 1 });
        mockExecuteSql.mockResolvedValueOnce({ rows: [updated] });

        const ds = loadModule();
        const result = await ds.upsertFromRemote({
            id: "srv-1",
            borrower: "Updated",
            amount: 1000,
            due_date: "2026-01-01",
            status: "active",
        });

        expect(result.borrower).toBe("Updated");
    });

    it("inserts new row when server_id is not found locally", async () => {
        const newRow = { local_id: "new-loc", server_id: "srv-2", borrower: "New" };

        // getLoanByServerId → not found
        mockExecuteSql.mockResolvedValueOnce({ rows: [] });
        // INSERT
        mockExecuteSql.mockResolvedValueOnce({ rows: [], rowsAffected: 1 });
        // getLoanByLocalId (return new row)
        mockExecuteSql.mockResolvedValueOnce({ rows: [newRow] });

        const ds = loadModule();
        const result = await ds.upsertFromRemote({
            id: "srv-2",
            borrower: "New",
            amount: 500,
            due_date: "2026-02-01",
            status: "pending",
        });

        expect(result.server_id).toBe("srv-2");
    });
});
