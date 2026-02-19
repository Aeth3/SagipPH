/**
 * ChatLocalDataSource - CRUD operations against the local SQLite `chats` table.
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

const normalizeUserId = (value) => {
    if (value === undefined || value === null) return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;
        if (/^\d+$/.test(trimmed)) return Number(trimmed);
        return trimmed;
    }
    return null;
};

const ensureChatsTable = async () => {
    if (tableReady) return;
    await ensureTable(CHATS_TABLE, CHATS_TABLE_COLUMNS);
    // Backward compatibility for existing installs created before `user_id` existed.
    const { rows: columns } = await executeSql(`PRAGMA table_info(${CHATS_TABLE})`);
    const hasUserId = columns.some((col) => col?.name === "user_id");
    if (!hasUserId) {
        await executeSql(`ALTER TABLE ${CHATS_TABLE} ADD COLUMN user_id INTEGER`);
    }
    tableReady = true;
};

export const getAllChats = async (userId) => {
    await ensureChatsTable();
    const normalizedUserId = normalizeUserId(userId);
    if (userId != null && normalizedUserId == null) {
        console.log(`${TAG} getAllChats(userId=missing) -> 0 rows`);
        return [];
    }
    const hasUserScope = normalizedUserId != null;
    const { rows } = await executeSql(
        hasUserScope
            ? `SELECT * FROM ${CHATS_TABLE} WHERE user_id = ? ORDER BY created_at DESC`
            : `SELECT * FROM ${CHATS_TABLE} ORDER BY created_at DESC`,
        hasUserScope ? [normalizedUserId] : []
    );
    console.log(`${TAG} getAllChats(userId=${normalizedUserId ?? "all"}) -> ${rows.length} rows`, rows);
    return rows;
};

export const getChatByLocalId = async (localId, userId) => {
    await ensureChatsTable();
    const normalizedUserId = normalizeUserId(userId);
    if (userId != null && normalizedUserId == null) {
        console.log(`${TAG} getChatByLocalId(${localId}, userId=missing) -> null`);
        return null;
    }
    const hasUserScope = normalizedUserId != null;
    const { rows } = await executeSql(
        hasUserScope
            ? `SELECT * FROM ${CHATS_TABLE} WHERE local_id = ? AND user_id = ?`
            : `SELECT * FROM ${CHATS_TABLE} WHERE local_id = ?`,
        hasUserScope ? [localId, normalizedUserId] : [localId]
    );
    console.log(`${TAG} getChatByLocalId(${localId}, userId=${normalizedUserId ?? "all"}) ->`, rows[0] ?? null);
    return rows[0] ?? null;
};

/**
 * Insert a new chat into SQLite.
 * @param {object} data - { title }
 * @returns {object} the full row as stored (snake_case keys)
 */
export const insertChat = async (data) => {
    console.log("data", data);

    await ensureChatsTable();
    const localId = uuid();
    const createdAt = now();
    const userId = normalizeUserId(
        data?.user_id !== undefined ? data.user_id : data?.userId
    );

    console.log(`${TAG} insertChat -> local_id=${localId}, user_id=${userId ?? "none"}, title="${data.title}"`);
    await executeSql(
        `INSERT INTO ${CHATS_TABLE}
       (local_id, user_id, title, created_at)
     VALUES (?, ?, ?, ?)`,
        [localId, userId ?? null, data.title, createdAt]
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
    if ("serverId" in normalized) {
        normalized.server_id = normalized.serverId;
        delete normalized.serverId;
    }

    for (const key of allowed) {
        if (key in normalized) {
            sets.push(`${key} = ?`);
            values.push(normalized[key]);
        }
    }

    if (sets.length === 0) return getChatByLocalId(localId);

    values.push(localId);

    console.log(`${TAG} updateChat(${localId}) -> SET ${sets.join(", ")}`);
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
    console.log(`${TAG} deleteChat -> rowsAffected=${rowsAffected}`);
    return rowsAffected > 0;
};

/**
 * Delete all chats.
 */
export const deleteAllChats = async () => {
    await ensureChatsTable();
    console.log(`${TAG} deleteAllChats`);
    const { rowsAffected } = await executeSql(
        `DELETE FROM ${CHATS_TABLE}`
    );
    console.log(`${TAG} deleteAllChats -> rowsAffected=${rowsAffected}`);
    return rowsAffected;
};

export const deleteAllChatsByUserId = async (userId) => {
    await ensureChatsTable();
    const normalizedUserId = normalizeUserId(userId);
    if (normalizedUserId == null) return 0;
    console.log(`${TAG} deleteAllChatsByUserId(${normalizedUserId})`);
    const { rowsAffected } = await executeSql(
        `DELETE FROM ${CHATS_TABLE} WHERE user_id = ?`,
        [normalizedUserId]
    );
    console.log(`${TAG} deleteAllChatsByUserId -> rowsAffected=${rowsAffected}`);
    return rowsAffected;
};
