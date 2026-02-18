/**
 * SQLite schema definition for the chats table.
 * Used by the local data source for offline‑first storage.
 */

export const CHATS_TABLE = "chats";

export const CHATS_TABLE_COLUMNS = `
  local_id TEXT PRIMARY KEY,
  server_id TEXT,
  user_id TEXT,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL
`;
