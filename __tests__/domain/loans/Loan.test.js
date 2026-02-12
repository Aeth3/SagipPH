import { Loan, LOAN_STATUSES, SYNC_STATUSES } from "../../../package/src/domain/entities/Loan";

describe("Loan entity", () => {
    // ── validateInput ──────────────────────────────────────────────────────

    describe("validateInput", () => {
        it("returns ok with normalized payload for valid input", () => {
            const result = Loan.validateInput({
                borrower: "  Alice  ",
                amount: "5000",
                dueDate: " 2026-06-01 ",
                status: "active",
                term: "12",
            });

            expect(result.ok).toBe(true);
            expect(result.value).toEqual({
                borrower: "Alice",
                amount: 5000,
                dueDate: "2026-06-01",
                status: "active",
                term: 12,
            });
        });

        it("defaults status to 'pending' when omitted", () => {
            const result = Loan.validateInput({
                borrower: "Bob",
                amount: "1000",
                dueDate: "2026-07-01",
            });

            expect(result.ok).toBe(true);
            expect(result.value.status).toBe("pending");
        });

        it("omits term when it is empty", () => {
            const result = Loan.validateInput({
                borrower: "Carol",
                amount: "2000",
                dueDate: "2026-08-01",
                term: "",
            });

            expect(result.ok).toBe(true);
            expect(result.value).not.toHaveProperty("term");
        });

        it("fails when borrower is missing", () => {
            const result = Loan.validateInput({
                borrower: "   ",
                amount: "1000",
                dueDate: "2026-06-01",
            });

            expect(result.ok).toBe(false);
            expect(result.error).toEqual({
                code: "VALIDATION_ERROR",
                message: "Borrower is required.",
            });
        });

        it("fails when amount is not a finite number", () => {
            const result = Loan.validateInput({
                borrower: "Dan",
                amount: "abc",
                dueDate: "2026-06-01",
            });

            expect(result.ok).toBe(false);
            expect(result.error).toEqual({
                code: "VALIDATION_ERROR",
                message: "Amount is required.",
            });
        });

        it("fails when dueDate is missing", () => {
            const result = Loan.validateInput({
                borrower: "Eve",
                amount: "3000",
                dueDate: "  ",
            });

            expect(result.ok).toBe(false);
            expect(result.error).toEqual({
                code: "VALIDATION_ERROR",
                message: "Due date is required.",
            });
        });

        it("handles undefined input gracefully", () => {
            const result = Loan.validateInput();

            expect(result.ok).toBe(false);
            expect(result.error.code).toBe("VALIDATION_ERROR");
        });

        it("fails when status is not a valid predefined value", () => {
            const result = Loan.validateInput({
                borrower: "Frank",
                amount: "2000",
                dueDate: "2026-09-01",
                status: "unknown",
            });

            expect(result.ok).toBe(false);
            expect(result.error).toEqual({
                code: "VALIDATION_ERROR",
                message: expect.stringContaining("Invalid status"),
            });
        });

        it("accepts all valid LOAN_STATUSES values", () => {
            Object.values(LOAN_STATUSES).forEach((status) => {
                const result = Loan.validateInput({
                    borrower: "Grace",
                    amount: "1000",
                    dueDate: "2026-10-01",
                    status,
                });

                expect(result.ok).toBe(true);
                expect(result.value.status).toBe(status);
            });
        });
    });

    // ── fromDTO ────────────────────────────────────────────────────────────

    describe("fromDTO", () => {
        it("maps snake_case API fields to camelCase entity properties", () => {
            const loan = Loan.fromDTO({
                id: 1,
                borrower: "Alice",
                amount: 5000,
                term: 12,
                due_date: "2026-06-01",
                status: "active",
                created_at: "2025-01-01",
                updated_at: "2025-02-01",
            });

            expect(loan).toBeInstanceOf(Loan);
            expect(loan.id).toBe(1);
            expect(loan.borrower).toBe("Alice");
            expect(loan.amount).toBe(5000);
            expect(loan.term).toBe(12);
            expect(loan.dueDate).toBe("2026-06-01");
            expect(loan.status).toBe("active");
            expect(loan.createdAt).toBe("2025-01-01");
            expect(loan.updatedAt).toBe("2025-02-01");
            expect(loan.pending).toBe(false);
        });

        it("falls back to camelCase fields when snake_case is absent", () => {
            const loan = Loan.fromDTO({
                id: 2,
                borrower: "Bob",
                amount: 1000,
                dueDate: "2026-07-01",
                createdAt: "2025-03-01",
                updatedAt: "2025-04-01",
            });

            expect(loan.dueDate).toBe("2026-07-01");
            expect(loan.createdAt).toBe("2025-03-01");
            expect(loan.updatedAt).toBe("2025-04-01");
        });

        it("supports _id as an alternative to id", () => {
            const loan = Loan.fromDTO({ _id: 99, borrower: "Carol", amount: 500 });
            expect(loan.id).toBe(99);
        });

        it("handles empty input without throwing", () => {
            const loan = Loan.fromDTO();
            expect(loan).toBeInstanceOf(Loan);
            expect(loan.id).toBeUndefined();
        });
    });

    // ── toDTO ──────────────────────────────────────────────────────────────

    describe("toDTO", () => {
        it("converts entity back to snake_case DTO", () => {
            const loan = new Loan({
                id: 1,
                localId: "loc-1",
                serverId: "srv-1",
                borrower: "Alice",
                amount: 5000,
                term: 12,
                dueDate: "2026-06-01",
                status: "active",
                createdAt: "2025-01-01",
                updatedAt: "2025-02-01",
                syncStatus: "synced",
            });

            expect(loan.toDTO()).toEqual({
                id: 1,
                local_id: "loc-1",
                server_id: "srv-1",
                borrower: "Alice",
                amount: 5000,
                term: 12,
                due_date: "2026-06-01",
                status: "active",
                created_at: "2025-01-01",
                updated_at: "2025-02-01",
                sync_status: "synced",
                sync_error: null,
            });
        });
    });

    // ── isPending ──────────────────────────────────────────────────────────

    describe("isPending", () => {
        it("returns true when pending flag is truthy", () => {
            expect(new Loan({ pending: true }).isPending()).toBe(true);
        });

        it("returns false by default", () => {
            expect(new Loan().isPending()).toBe(false);
        });
    });

    // ── Sync status helpers ────────────────────────────────────────────────

    describe("sync status helpers", () => {
        it("isSynced returns true when synced", () => {
            expect(new Loan({ syncStatus: SYNC_STATUSES.SYNCED }).isSynced()).toBe(true);
        });

        it("isSyncPending returns true for default/pending", () => {
            expect(new Loan().isSyncPending()).toBe(true);
            expect(new Loan({ syncStatus: SYNC_STATUSES.PENDING }).isSyncPending()).toBe(true);
        });

        it("isSyncFailed returns true when failed", () => {
            expect(new Loan({ syncStatus: SYNC_STATUSES.FAILED }).isSyncFailed()).toBe(true);
        });
    });

    // ── fromDTO sync fields ────────────────────────────────────────────────

    describe("fromDTO with sync fields", () => {
        it("maps sync_status and sync_error from snake_case", () => {
            const loan = Loan.fromDTO({ sync_status: "failed", sync_error: "timeout" });
            expect(loan.syncStatus).toBe("failed");
            expect(loan.syncError).toBe("timeout");
        });

        it("maps local_id and server_id", () => {
            const loan = Loan.fromDTO({ local_id: "loc-1", server_id: "srv-1" });
            expect(loan.localId).toBe("loc-1");
            expect(loan.serverId).toBe("srv-1");
        });

        it("defaults syncStatus to pending when absent", () => {
            const loan = Loan.fromDTO({ borrower: "X" });
            expect(loan.syncStatus).toBe(SYNC_STATUSES.PENDING);
        });
    });

    // ── toRemoteDTO ────────────────────────────────────────────────────────

    describe("toRemoteDTO", () => {
        it("excludes local-only fields", () => {
            const loan = new Loan({
                id: 1,
                localId: "loc-1",
                serverId: "srv-1",
                borrower: "Alice",
                amount: 5000,
                term: 12,
                dueDate: "2026-06-01",
                status: "active",
                syncStatus: "synced",
                syncError: null,
            });

            const dto = loan.toRemoteDTO();
            expect(dto).toEqual({
                id: "srv-1",
                borrower: "Alice",
                amount: 5000,
                term: 12,
                due_date: "2026-06-01",
                status: "active",
            });
            expect(dto).not.toHaveProperty("local_id");
            expect(dto).not.toHaveProperty("sync_status");
        });

        it("omits id when serverId is null", () => {
            const loan = new Loan({ borrower: "Bob", amount: 100, dueDate: "2026-01-01", status: "pending" });
            const dto = loan.toRemoteDTO();
            expect(dto).not.toHaveProperty("id");
        });
    });
});
