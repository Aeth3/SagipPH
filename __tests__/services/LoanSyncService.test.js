/**
 * Tests for LoanSyncService — push/pull orchestration.
 */

let mockLocal;
let mockRemote;
let mockGetIsOnline;

beforeEach(() => {
    jest.resetModules();

    mockLocal = {
        getPendingSyncLoans: jest.fn().mockResolvedValue([]),
        markSynced: jest.fn().mockResolvedValue({}),
        markSyncFailed: jest.fn().mockResolvedValue({}),
        upsertFromRemote: jest.fn().mockResolvedValue({}),
    };

    mockRemote = {
        pushLoan: jest.fn().mockResolvedValue({ id: "srv-1" }),
        fetchAllLoans: jest.fn().mockResolvedValue([]),
    };

    mockGetIsOnline = jest.fn().mockReturnValue(true);

    jest.doMock(
        "../../package/src/data/datasources/LoanLocalDataSource",
        () => mockLocal
    );
    jest.doMock(
        "../../package/src/data/datasources/LoanRemoteDataSource",
        () => mockRemote
    );
    jest.doMock(
        "../../package/src/infra/network/networkMonitor",
        () => ({ getIsOnline: mockGetIsOnline })
    );
});

const loadModule = () => {
    let mod;
    jest.isolateModules(() => {
        mod = require("../../package/src/services/LoanSyncService");
    });
    return mod;
};

// ── pushPendingLoans ────────────────────────────────────────────────────

describe("pushPendingLoans", () => {
    it("pushes each pending loan and marks synced", async () => {
        const pending = [
            { local_id: "a", borrower: "Alice", amount: 100, due_date: "2026-01-01", status: "pending" },
        ];
        mockLocal.getPendingSyncLoans.mockResolvedValue(pending);
        mockRemote.pushLoan.mockResolvedValue({ id: "srv-a" });

        const svc = loadModule();
        const result = await svc.pushPendingLoans();

        expect(mockRemote.pushLoan).toHaveBeenCalledTimes(1);
        expect(mockLocal.markSynced).toHaveBeenCalledWith("a", "srv-a");
        expect(result).toEqual({ pushed: 1, failed: 0 });
    });

    it("marks loan as failed on 4xx error", async () => {
        const pending = [{ local_id: "b", borrower: "Bob", amount: 200, due_date: "2026-02-01", status: "pending" }];
        mockLocal.getPendingSyncLoans.mockResolvedValue(pending);
        mockRemote.pushLoan.mockRejectedValue({ status: 400, message: "Bad Request" });

        const svc = loadModule();
        const result = await svc.pushPendingLoans();

        expect(mockLocal.markSyncFailed).toHaveBeenCalledWith("b", "Bad Request");
        expect(result.failed).toBe(1);
    });

    it("leaves loan as pending on network error (does not mark failed)", async () => {
        const pending = [{ local_id: "c", borrower: "C", amount: 300, due_date: "2026-03-01", status: "pending" }];
        mockLocal.getPendingSyncLoans.mockResolvedValue(pending);
        mockRemote.pushLoan.mockRejectedValue(new Error("Network Error"));

        const svc = loadModule();
        const result = await svc.pushPendingLoans();

        // Should NOT have called markSyncFailed because it's a retryable error
        expect(mockLocal.markSyncFailed).not.toHaveBeenCalled();
        expect(result.failed).toBe(1);
    });

    it("skips when offline", async () => {
        mockGetIsOnline.mockReturnValue(false);

        const svc = loadModule();
        const result = await svc.pushPendingLoans();

        expect(result).toEqual({ pushed: 0, failed: 0 });
        expect(mockLocal.getPendingSyncLoans).not.toHaveBeenCalled();
    });
});

// ── pullRemoteLoans ─────────────────────────────────────────────────────

describe("pullRemoteLoans", () => {
    it("upserts each remote loan into local DB", async () => {
        const remoteRows = [
            { id: "srv-1", borrower: "Alice", amount: 1000 },
            { id: "srv-2", borrower: "Bob", amount: 2000 },
        ];
        mockRemote.fetchAllLoans.mockResolvedValue(remoteRows);

        const svc = loadModule();
        const result = await svc.pullRemoteLoans();

        expect(mockLocal.upsertFromRemote).toHaveBeenCalledTimes(2);
        expect(result).toEqual({ upserted: 2 });
    });

    it("skips when offline", async () => {
        mockGetIsOnline.mockReturnValue(false);

        const svc = loadModule();
        const result = await svc.pullRemoteLoans();

        expect(result).toEqual({ upserted: 0 });
    });
});

// ── syncLoans ───────────────────────────────────────────────────────────

describe("syncLoans", () => {
    it("runs push then pull and returns combined result", async () => {
        mockLocal.getPendingSyncLoans.mockResolvedValue([]);
        mockRemote.fetchAllLoans.mockResolvedValue([{ id: "srv-1", borrower: "X", amount: 100 }]);

        const svc = loadModule();
        const result = await svc.syncLoans();

        expect(result.skipped).toBe(false);
        expect(result.pushed).toBe(0);
        expect(result.upserted).toBe(1);
    });
});
