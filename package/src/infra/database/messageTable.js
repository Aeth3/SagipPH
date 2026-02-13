/**
 * SQLite schema definition for the chats table.
 * Used by the local data source for offline‑first storage.
 */

export const MESSAGES_TABLE = "messages";

export const MESSAGES_TABLE_COLUMNS = `
  local_id TEXT PRIMARY KEY,
  server_id TEXT,
  chat_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
`;
