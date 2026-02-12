/**
 * Tests for the refactored offline‑first LoanRepositoryImpl.
 *
 * The repository now reads from SQLite (LoanLocalDataSource) and triggers
 * background sync via LoanSyncService.
 */

let mockLocalDS;
let mockSyncLoans;

const loadLoanRepositoryModule = () => {
    jest.resetModules();

    mockLocalDS = {
        getAllLoans: jest.fn().mockResolvedValue([]),
        getLoanByLocalId: jest.fn().mockResolvedValue(null),
        getLoanByServerId: jest.fn().mockResolvedValue(null),
        insertLoan: jest.fn().mockResolvedValue({ local_id: "new-id" }),
        updateLoanByLocalId: jest.fn().mockResolvedValue({ local_id: "id" }),
        deleteLoanByLocalId: jest.fn().mockResolvedValue(true),
    };

    mockSyncLoans = jest.fn().mockResolvedValue({});

    jest.doMock(
        "../../../package/src/data/datasources/LoanLocalDataSource",
        () => mockLocalDS
    );

    jest.doMock(
        "../../../package/src/services/LoanSyncService",
        () => ({ syncLoans: mockSyncLoans })
    );

    jest.doMock(
        "../../../package/src/domain/entities/Loan",
        () => ({
            Loan: {
                fromDTO: jest.fn((dto) => ({ ...dto, _mapped: true })),
            },
        })
    );

    let moduleUnderTest;
    jest.isolateModules(() => {
        moduleUnderTest = require("../../../package/src/data/repositories/LoanRepositoryImpl");
    });

    return { moduleUnderTest };
};

// ── getLoans ────────────────────────────────────────────────────────────

describe("LoanRepositoryImpl (offline-first)", () => {
    describe("getLoans", () => {
        it("reads from local SQLite and returns mapped Loan entities", async () => {
            const { moduleUnderTest } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockLocalDS.getAllLoans.mockResolvedValue([
                { local_id: "a", borrower: "Alice" },
                { local_id: "b", borrower: "Bob" },
            ]);

            const result = await repo.getLoans();

            expect(mockLocalDS.getAllLoans).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0]._mapped).toBe(true);
        });

        it("triggers background sync", async () => {
            const { moduleUnderTest } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockLocalDS.getAllLoans.mockResolvedValue([]);
            await repo.getLoans();

            // syncLoans is fire-and-forget; just verify it was called
            expect(mockSyncLoans).toHaveBeenCalled();
        });
    });

    // ── getLoanById ──────────────────────────────────────────────────────

    describe("getLoanById", () => {
        it("finds by local_id first", async () => {
            const { moduleUnderTest } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockLocalDS.getLoanByLocalId.mockResolvedValue({ local_id: "abc", borrower: "Alice" });

            const result = await repo.getLoanById("abc");

            expect(result._mapped).toBe(true);
            expect(mockLocalDS.getLoanByLocalId).toHaveBeenCalledWith("abc");
        });

        it("falls back to server_id lookup", async () => {
            const { moduleUnderTest } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockLocalDS.getLoanByLocalId.mockResolvedValue(null);
            mockLocalDS.getLoanByServerId.mockResolvedValue({ server_id: "srv-1", borrower: "Bob" });

            const result = await repo.getLoanById("srv-1");

            expect(mockLocalDS.getLoanByServerId).toHaveBeenCalledWith("srv-1");
            expect(result._mapped).toBe(true);
        });

        it("returns null when not found anywhere", async () => {
            const { moduleUnderTest } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            const result = await repo.getLoanById("missing");

            expect(result).toBeNull();
        });
    });

    // ── createLoan ──────────────────────────────────────────────────────

    describe("createLoan", () => {
        it("inserts into SQLite and triggers sync", async () => {
            const { moduleUnderTest } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            const inserted = { local_id: "new-id", borrower: "Carol" };
            mockLocalDS.insertLoan.mockResolvedValue(inserted);

            const result = await repo.createLoan({ borrower: "Carol", amount: 5000 });

            expect(mockLocalDS.insertLoan).toHaveBeenCalledWith({ borrower: "Carol", amount: 5000 });
            expect(result._mapped).toBe(true);
            expect(mockSyncLoans).toHaveBeenCalled();
        });
    });

    // ── updateLoan ──────────────────────────────────────────────────────

    describe("updateLoan", () => {
        it("updates locally and marks sync_status as pending", async () => {
            const { moduleUnderTest } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockLocalDS.getLoanByLocalId.mockResolvedValue({ local_id: "abc" });
            mockLocalDS.updateLoanByLocalId.mockResolvedValue({ local_id: "abc", borrower: "Updated" });

            const result = await repo.updateLoan("abc", { borrower: "Updated" });

            expect(mockLocalDS.updateLoanByLocalId).toHaveBeenCalledWith(
                "abc",
                expect.objectContaining({ borrower: "Updated", sync_status: "pending" })
            );
            expect(result._mapped).toBe(true);
            expect(mockSyncLoans).toHaveBeenCalled();
        });

        it("throws when loan is not found", async () => {
            const { moduleUnderTest } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            await expect(repo.updateLoan("missing", {})).rejects.toThrow("not found");
        });
    });

    // ── deleteLoan ──────────────────────────────────────────────────────

    describe("deleteLoan", () => {
        it("deletes from local DB by local_id", async () => {
            const { moduleUnderTest } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockLocalDS.getLoanByLocalId.mockResolvedValue({ local_id: "abc" });

            const result = await repo.deleteLoan("abc");

            expect(mockLocalDS.deleteLoanByLocalId).toHaveBeenCalledWith("abc");
            expect(result).toEqual({ success: true });
        });

        it("looks up by server_id as fallback", async () => {
            const { moduleUnderTest } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockLocalDS.getLoanByLocalId.mockResolvedValue(null);
            mockLocalDS.getLoanByServerId.mockResolvedValue({ local_id: "loc-from-srv", server_id: "srv-1" });

            await repo.deleteLoan("srv-1");

            expect(mockLocalDS.deleteLoanByLocalId).toHaveBeenCalledWith("loc-from-srv");
        });
    });
});
