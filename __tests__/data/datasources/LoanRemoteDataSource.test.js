/**
 * Tests for LoanRemoteDataSource — Supabase API layer for loans.
 */

let mockApiClient;

beforeEach(() => {
    jest.resetModules();

    mockApiClient = { request: jest.fn() };

    jest.doMock(
        "../../../package/src/infra/http/apiClient",
        () => ({ __esModule: true, default: mockApiClient })
    );
});

const loadModule = () => require("../../../package/src/data/datasources/LoanRemoteDataSource");

// ── fetchAllLoans ───────────────────────────────────────────────────────

describe("fetchAllLoans", () => {
    it("returns array of loans from API", async () => {
        const data = [{ id: 1, borrower: "Alice" }];
        mockApiClient.request.mockResolvedValue(data);

        const ds = loadModule();
        const result = await ds.fetchAllLoans();

        expect(mockApiClient.request).toHaveBeenCalledWith({ method: "GET", url: "/loans" });
        expect(result).toEqual(data);
    });

    it("returns empty array when response is not an array", async () => {
        mockApiClient.request.mockResolvedValue(null);

        const ds = loadModule();
        const result = await ds.fetchAllLoans();

        expect(result).toEqual([]);
    });
});

// ── pushLoan ────────────────────────────────────────────────────────────

describe("pushLoan", () => {
    it("sends POST and returns created row", async () => {
        const created = { id: 10, borrower: "Bob" };
        mockApiClient.request.mockResolvedValue([created]);

        const ds = loadModule();
        const result = await ds.pushLoan({ borrower: "Bob", amount: 1000, due_date: "2026-01-01", status: "pending" });

        expect(mockApiClient.request).toHaveBeenCalledWith(
            expect.objectContaining({ method: "POST", url: "/loans" })
        );
        expect(result).toEqual(created);
    });

    it("handles non-array response", async () => {
        const created = { id: 11 };
        mockApiClient.request.mockResolvedValue(created);

        const ds = loadModule();
        const result = await ds.pushLoan({ borrower: "C" });

        expect(result).toEqual(created);
    });
});

// ── pushLoanUpdate ──────────────────────────────────────────────────────

describe("pushLoanUpdate", () => {
    it("sends PATCH with server id", async () => {
        mockApiClient.request.mockResolvedValue([{ id: 1, borrower: "Updated" }]);

        const ds = loadModule();
        const result = await ds.pushLoanUpdate(1, { borrower: "Updated" });

        expect(mockApiClient.request).toHaveBeenCalledWith(
            expect.objectContaining({ method: "PATCH", url: "/loans?id=eq.1" })
        );
        expect(result.borrower).toBe("Updated");
    });
});

// ── pushLoanDelete ──────────────────────────────────────────────────────

describe("pushLoanDelete", () => {
    it("sends DELETE with server id", async () => {
        mockApiClient.request.mockResolvedValue(undefined);

        const ds = loadModule();
        await ds.pushLoanDelete(5);

        expect(mockApiClient.request).toHaveBeenCalledWith(
            expect.objectContaining({ method: "DELETE", url: "/loans?id=eq.5" })
        );
    });
});
