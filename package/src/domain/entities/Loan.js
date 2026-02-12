export class Loan {
  constructor({ id, amount, term, status, createdAt, updatedAt, pending = false } = {}) {
    this.id = id;
    this.amount = amount;
    this.term = term;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.pending = pending;
  }

  static fromDTO(raw = {}) {
    return new Loan({
      id: raw.id ?? raw._id,
      amount: raw.amount,
      term: raw.term,
      status: raw.status,
      createdAt: raw.created_at || raw.createdAt,
      updatedAt: raw.updated_at || raw.updatedAt,
      pending: raw.pending || false,
    });
  }

  toDTO() {
    return {
      id: this.id,
      amount: this.amount,
      term: this.term,
      status: this.status,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  isPending() { return !!this.pending; }
}