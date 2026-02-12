const loadLoanRepositoryModule = () => {
    jest.resetModules();

    const mockRequestOfflineFirst = jest.fn();

    jest.doMock(
        "../../../package/src/infra/http/offlineHttp",
        () => ({
            requestOfflineFirst: mockRequestOfflineFirst,
        })
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

    return { moduleUnderTest, mockRequestOfflineFirst };
};

describe("LoanRepositoryImpl", () => {
    describe("getLoans", () => {
        it("maps array response to Loan entities", async () => {
            const { moduleUnderTest, mockRequestOfflineFirst } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockRequestOfflineFirst.mockResolvedValue([
                { id: 1, borrower: "Alice" },
                { id: 2, borrower: "Bob" },
            ]);

            const result = await repo.getLoans();
            expect(mockRequestOfflineFirst).toHaveBeenCalledWith(
                { method: "GET", url: "/loans" },
                { cacheReads: true }
            );
            expect(result).toHaveLength(2);
            expect(result[0]._mapped).toBe(true);
        });

        it("handles offline-cached object-style arrays", async () => {
            const { moduleUnderTest, mockRequestOfflineFirst } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockRequestOfflineFirst.mockResolvedValue({
                0: { id: 1 },
                1: { id: 2 },
                length: 2,
            });

            const result = await repo.getLoans();
            expect(result).toHaveLength(2);
        });

        it("returns empty array when response is empty", async () => {
            const { moduleUnderTest, mockRequestOfflineFirst } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockRequestOfflineFirst.mockResolvedValue([]);
            const result = await repo.getLoans();
            expect(result).toEqual([]);
        });
    });

    describe("getLoanById", () => {
        it("returns mapped loan when found", async () => {
            const { moduleUnderTest, mockRequestOfflineFirst } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockRequestOfflineFirst.mockResolvedValue([{ id: 1, borrower: "Alice" }]);
            const result = await repo.getLoanById(1);
            expect(result._mapped).toBe(true);
        });

        it("returns null when not found", async () => {
            const { moduleUnderTest, mockRequestOfflineFirst } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockRequestOfflineFirst.mockResolvedValue([]);
            const result = await repo.getLoanById(999);
            expect(result).toBeNull();
        });
    });

    describe("createLoan", () => {
        it("sends snake_case data and returns mapped loan", async () => {
            const { moduleUnderTest, mockRequestOfflineFirst } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockRequestOfflineFirst.mockResolvedValue([{ id: 10, borrower: "C" }]);
            const result = await repo.createLoan({ borrower: "C", dueDate: "2026-01-01" });
            expect(mockRequestOfflineFirst).toHaveBeenCalledWith(
                expect.objectContaining({ method: "POST", url: "/loans" }),
                expect.objectContaining({ queueOfflineWrites: true })
            );
            expect(result._mapped).toBe(true);
        });

        it("returns queued metadata when offline", async () => {
            const { moduleUnderTest, mockRequestOfflineFirst } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockRequestOfflineFirst.mockResolvedValue({ queued: true });
            const result = await repo.createLoan({ borrower: "C" });
            expect(result).toEqual({ queued: true });
        });
    });

    describe("updateLoan", () => {
        it("sends PATCH with id in url", async () => {
            const { moduleUnderTest, mockRequestOfflineFirst } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockRequestOfflineFirst.mockResolvedValue([{ id: 1, borrower: "Updated" }]);
            const result = await repo.updateLoan(1, { borrower: "Updated" });
            expect(mockRequestOfflineFirst).toHaveBeenCalledWith(
                expect.objectContaining({ method: "PATCH", url: "/loans?id=eq.1" }),
                expect.objectContaining({ queueOfflineWrites: true })
            );
            expect(result._mapped).toBe(true);
        });

        it("returns queued metadata when offline", async () => {
            const { moduleUnderTest, mockRequestOfflineFirst } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockRequestOfflineFirst.mockResolvedValue({ queued: true });
            const result = await repo.updateLoan(1, { borrower: "X" });
            expect(result).toEqual({ queued: true });
        });
    });

    describe("deleteLoan", () => {
        it("sends DELETE with id in url", async () => {
            const { moduleUnderTest, mockRequestOfflineFirst } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockRequestOfflineFirst.mockResolvedValue({});
            const result = await repo.deleteLoan(1);
            expect(mockRequestOfflineFirst).toHaveBeenCalledWith(
                expect.objectContaining({ method: "DELETE", url: "/loans?id=eq.1" }),
                expect.objectContaining({ queueOfflineWrites: true })
            );
            expect(result).toEqual({ success: true });
        });

        it("returns queued metadata when offline", async () => {
            const { moduleUnderTest, mockRequestOfflineFirst } = loadLoanRepositoryModule();
            const repo = new moduleUnderTest.LoanRepositoryImpl();

            mockRequestOfflineFirst.mockResolvedValue({ queued: true });
            const result = await repo.deleteLoan(1);
            expect(result).toEqual({ queued: true });
        });
    });
});
