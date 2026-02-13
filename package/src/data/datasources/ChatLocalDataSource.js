/**
 * ChatLocalDataSource – CRUD operations against the local SQLite `chats` table.
 */
import { executeSql, ensureTable } from "../../infra/database/sqliteAdapter";
import { CHATS_TABLE, CHATS_TABLE_COLUMNS } from "../../infra/database/chatTable";

const TAG = "[ChatDS]";

/** Generate a v4-style UUID (good enough for local primary keys). */
const uuid = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });

const now = () => new Date().toISOString();

let tableReady = false;

const ensureChatsTable = async () => {
    if (tableReady) return;
    await ensureTable(CHATS_TABLE, CHATS_TABLE_COLUMNS);
    tableReady = true;
};

// ── READ ────────────────────────────────────────────────────────────────

export const getAllChats = async () => {
    await ensureChatsTable();
    const { rows } = await executeSql(
        `SELECT * FROM ${CHATS_TABLE} ORDER BY created_at DESC`
    );
    console.log(`${TAG} getAllChats → ${rows.length} rows`, rows);
    return rows;
};

export const getChatByLocalId = async (localId) => {
    await ensureChatsTable();
    const { rows } = await executeSql(
        `SELECT * FROM ${CHATS_TABLE} WHERE local_id = ?`,
        [localId]
    );
    console.log(`${TAG} getChatByLocalId(${localId}) →`, rows[0] ?? null);
    return rows[0] ?? null;
};

// ── WRITE ───────────────────────────────────────────────────────────────

/**
 * Insert a new chat into SQLite.
 * @param {object} data – { title }
 * @returns {object} the full row as stored (snake_case keys)
 */
export const insertChat = async (data) => {
    await ensureChatsTable();
    const localId = uuid();
    const createdAt = now();

    console.log(`${TAG} insertChat → local_id=${localId}, title="${data.title}"`);
    await executeSql(
        `INSERT INTO ${CHATS_TABLE}
       (local_id, title, created_at)
     VALUES (?, ?, ?)`,
        [localId, data.title, createdAt]
    );

    return getChatByLocalId(localId);
};

/**
 * Update an existing chat by its local_id.
 * Only the supplied keys will be changed.
 */
export const updateChatByLocalId = async (localId, changes) => {
    await ensureChatsTable();
    const allowed = ["title", "server_id"];
    const sets = [];
    const values = [];

    const normalized = { ...changes };
    if ("serverId" in normalized) { normalized.server_id = normalized.serverId; delete normalized.serverId; }

    for (const key of allowed) {
        if (key in normalized) {
            sets.push(`${key} = ?`);
            values.push(normalized[key]);
        }
    }

    if (sets.length === 0) return getChatByLocalId(localId);

    values.push(localId);

    console.log(`${TAG} updateChat(${localId}) → SET ${sets.join(", ")}`);
    await executeSql(
        `UPDATE ${CHATS_TABLE} SET ${sets.join(", ")} WHERE local_id = ?`,
        values
    );

    return getChatByLocalId(localId);
};

/**
 * Delete a chat by local_id.
 */
export const deleteChatByLocalId = async (localId) => {
    await ensureChatsTable();
    console.log(`${TAG} deleteChat(${localId})`);
    const { rowsAffected } = await executeSql(
        `DELETE FROM ${CHATS_TABLE} WHERE local_id = ?`,
        [localId]
    );
    console.log(`${TAG} deleteChat → rowsAffected=${rowsAffected}`);
    return rowsAffected > 0;
};
