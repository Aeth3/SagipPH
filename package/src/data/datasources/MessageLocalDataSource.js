/**
 * MessageLocalDataSource - CRUD operations against the local SQLite `messages` table.
 */
import { executeSql, ensureTable } from "../../infra/database/sqliteAdapter";
import { MESSAGES_TABLE, MESSAGES_TABLE_COLUMNS } from "../../infra/database/messageTable";

const TAG = "[MessageDS]";

/** Generate a v4-style UUID (good enough for local primary keys). */
const uuid = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });

const now = () => new Date().toISOString();

let tableReady = false;

const ensureMessagesTable = async () => {
    if (tableReady) return;
    await ensureTable(MESSAGES_TABLE, MESSAGES_TABLE_COLUMNS);
    tableReady = true;
};

/**
 * Get all messages for a given chat, ordered chronologically (oldest first).
 * @param {string} chatId - the local_id of the parent chat
 */
export const getMessagesByChatId = async (chatId) => {
    await ensureMessagesTable();
    const { rows } = await executeSql(
        `SELECT * FROM ${MESSAGES_TABLE} WHERE chat_id = ? ORDER BY created_at ASC`,
        [chatId]
    );
    console.log(`${TAG} getMessagesByChatId(${chatId}) -> ${rows.length} rows`);
    return rows;
};

export const getMessageByLocalId = async (localId) => {
    await ensureMessagesTable();
    const { rows } = await executeSql(
        `SELECT * FROM ${MESSAGES_TABLE} WHERE local_id = ?`,
        [localId]
    );
    console.log(`${TAG} getMessageByLocalId(${localId}) ->`, rows[0] ?? null);
    return rows[0] ?? null;
};

/**
 * Insert a new message into SQLite.
 * @param {object} data - { chatId, sender, content }
 * @returns {object} the full row as stored (snake_case keys)
 */
export const insertMessage = async (data) => {
    await ensureMessagesTable();
    const localId = uuid();
    const createdAt = now();

    console.log(
        `${TAG} insertMessage -> chat_id=${data.chat_id || data.chatId}, sender=${data.sender}, content="${data.content.substring(0, 50)}..."`
    );
    await executeSql(
        `INSERT INTO ${MESSAGES_TABLE}
       (local_id, chat_id, sender, content, created_at)
     VALUES (?, ?, ?, ?, ?)`,
        [
            localId,
            data.chat_id || data.chatId,
            data.sender,
            data.content,
            createdAt,
        ]
    );

    return getMessageByLocalId(localId);
};

/**
 * Delete all messages for a chat.
 * @param {string} chatId - the local_id of the parent chat
 */
export const deleteMessagesByChatId = async (chatId) => {
    await ensureMessagesTable();
    console.log(`${TAG} deleteMessagesByChatId(${chatId})`);
    const { rowsAffected } = await executeSql(
        `DELETE FROM ${MESSAGES_TABLE} WHERE chat_id = ?`,
        [chatId]
    );
    console.log(`${TAG} deleteMessagesByChatId -> rowsAffected=${rowsAffected}`);
    return rowsAffected;
};

/**
 * Delete a single message by local_id.
 */
export const deleteMessageByLocalId = async (localId) => {
    await ensureMessagesTable();
    console.log(`${TAG} deleteMessageByLocalId(${localId})`);
    const { rowsAffected } = await executeSql(
        `DELETE FROM ${MESSAGES_TABLE} WHERE local_id = ?`,
        [localId]
    );
    console.log(`${TAG} deleteMessageByLocalId -> rowsAffected=${rowsAffected}`);
    return rowsAffected > 0;
};

/**
 * Delete all messages.
 */
export const deleteAllMessages = async () => {
    await ensureMessagesTable();
    console.log(`${TAG} deleteAllMessages`);
    const { rowsAffected } = await executeSql(
        `DELETE FROM ${MESSAGES_TABLE}`
    );
    console.log(`${TAG} deleteAllMessages -> rowsAffected=${rowsAffected}`);
    return rowsAffected;
};
