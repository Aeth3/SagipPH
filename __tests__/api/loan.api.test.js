jest.mock("../../package/src/infra/http/offlineHttp", () => ({
    requestOfflineFirst: jest.fn(),
}));

const { requestOfflineFirst } = require("../../package/src/infra/http/offlineHttp");
const { LoanAPI } = require("../../package/src/api/loan.api");

describe("LoanAPI", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getLoans", () => {
        it("calls requestOfflineFirst with GET /loans", async () => {
            requestOfflineFirst.mockResolvedValue([{ id: 1 }]);
            const result = await LoanAPI.getLoans();
            expect(requestOfflineFirst).toHaveBeenCalledWith({
                method: "GET",
                url: "/loans",
            });
            expect(result).toEqual([{ id: 1 }]);
        });
    });

    describe("createLoan", () => {
        it("sends POST with data and queueOfflineWrites", async () => {
            const data = { borrower: "Alice", amount: 100 };
            requestOfflineFirst.mockResolvedValue({ id: 1, ...data });
            const result = await LoanAPI.createLoan(data);
            expect(requestOfflineFirst).toHaveBeenCalledWith(
                { method: "POST", url: "/loans", data },
                { queueOfflineWrites: true, cacheReads: false }
            );
            expect(result).toEqual({ id: 1, ...data });
        });
    });

    describe("updateLoan", () => {
        it("sends PATCH with id in query and data", async () => {
            const data = { borrower: "Bob" };
            requestOfflineFirst.mockResolvedValue({ id: 5, ...data });
            const result = await LoanAPI.updateLoan(5, data);
            expect(requestOfflineFirst).toHaveBeenCalledWith(
                { method: "PATCH", url: "/loans?id=eq.5", data },
                { queueOfflineWrites: true, cacheReads: false }
            );
            expect(result).toEqual({ id: 5, ...data });
        });
    });

    describe("deleteLoan", () => {
        it("sends DELETE with id in query", async () => {
            requestOfflineFirst.mockResolvedValue({});
            const result = await LoanAPI.deleteLoan(3);
            expect(requestOfflineFirst).toHaveBeenCalledWith(
                { method: "DELETE", url: "/loans?id=eq.3" },
                { queueOfflineWrites: true }
            );
            expect(result).toEqual({});
        });
    });
});
