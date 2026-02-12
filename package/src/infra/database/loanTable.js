/**
 * SQLite schema definition for the loans table.
 * Used by the local data source for offline‑first storage.
 */

export const LOANS_TABLE = "loans";

export const LOANS_TABLE_COLUMNS = `
  local_id TEXT PRIMARY KEY,
  server_id TEXT,
  borrower TEXT NOT NULL,
  amount REAL NOT NULL,
  term INTEGER,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sync_status TEXT NOT NULL DEFAULT 'pending',
  sync_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
`;
