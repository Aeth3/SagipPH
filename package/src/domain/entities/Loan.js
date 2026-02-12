import { ok, fail } from "../shared/result";

export const LOAN_STATUSES = Object.freeze({
  PENDING: "pending",
  ACTIVE: "active",
  COMPLETED: "completed",
  DEFAULTED: "defaulted",
  CANCELLED: "cancelled",
});

export const SYNC_STATUSES = Object.freeze({
  PENDING: "pending",
  SYNCED: "synced",
  FAILED: "failed",
});

const VALID_STATUS_VALUES = Object.values(LOAN_STATUSES);

export class Loan {
  constructor({ id, localId, serverId, amount, term, borrower, dueDate, status, createdAt, updatedAt, pending = false, syncStatus = SYNC_STATUSES.PENDING, syncError = null } = {}) {
    this.id = id;
    this.localId = localId ?? null;
    this.serverId = serverId ?? null;
    this.amount = amount;
    this.term = term;
    this.borrower = borrower;
    this.dueDate = dueDate;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.pending = pending;
    this.syncStatus = syncStatus;
    this.syncError = syncError;
  }

  /**
   * Validate and normalize raw input (e.g. from a form).
   * Returns ok({ borrower, amount, dueDate, status, term? }) or fail(...).
   */
  static validateInput(raw = {}) {
    const borrower = typeof raw.borrower === "string" ? raw.borrower.trim() : "";
    const amountRaw = raw.amount;
    const amount = typeof amountRaw === "string" ? Number(amountRaw) : Number(amountRaw);
    const dueDate = typeof raw.dueDate === "string" ? raw.dueDate.trim() : "";
    const status = (typeof raw.status === "string" ? raw.status.trim() : "") || "pending";
    const termRaw = raw.term;
    const term = termRaw != null && termRaw !== "" ? Number(termRaw) : null;

    if (!borrower) return fail("VALIDATION_ERROR", "Borrower is required.");
    if (!Number.isFinite(amount)) return fail("VALIDATION_ERROR", "Amount is required.");
    if (!dueDate) return fail("VALIDATION_ERROR", "Due date is required.");
    if (!VALID_STATUS_VALUES.includes(status))
      return fail("VALIDATION_ERROR", `Invalid status "${status}". Must be one of: ${VALID_STATUS_VALUES.join(", ")}.`);

    const payload = { borrower, amount, dueDate, status };
    if (term != null && Number.isFinite(term)) payload.term = term;

    return ok(payload);
  }

  static fromDTO(raw = {}) {
    return new Loan({
      id: raw.id ?? raw._id,
      localId: raw.local_id || raw.localId || null,
      serverId: raw.server_id || raw.serverId || null,
      amount: raw.amount,
      term: raw.term,
      borrower: raw.borrower,
      dueDate: raw.due_date || raw.dueDate,
      status: raw.status,
      createdAt: raw.created_at || raw.createdAt,
      updatedAt: raw.updated_at || raw.updatedAt,
      pending: raw.pending || false,
      syncStatus: raw.sync_status || raw.syncStatus || SYNC_STATUSES.PENDING,
      syncError: raw.sync_error || raw.syncError || null,
    });
  }

  toDTO() {
    return {
      id: this.id,
      local_id: this.localId,
      server_id: this.serverId,
      amount: this.amount,
      term: this.term,
      borrower: this.borrower,
      due_date: this.dueDate,
      status: this.status,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      sync_status: this.syncStatus,
      sync_error: this.syncError,
    };
  }

  /** DTO suitable for sending to the remote API (excludes local-only fields). */
  toRemoteDTO() {
    const dto = {
      amount: this.amount,
      term: this.term,
      borrower: this.borrower,
      due_date: this.dueDate,
      status: this.status,
    };
    if (this.serverId) dto.id = this.serverId;
    return dto;
  }

  isPending() { return !!this.pending; }
  isSynced() { return this.syncStatus === SYNC_STATUSES.SYNCED; }
  isSyncPending() { return this.syncStatus === SYNC_STATUSES.PENDING; }
  isSyncFailed() { return this.syncStatus === SYNC_STATUSES.FAILED; }
}