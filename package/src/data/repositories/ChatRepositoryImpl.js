import { ChatRepository } from "../../domain/repositories/ChatRepository";
import { Chat } from "../../domain/entities/Chat";
import { Message } from "../../domain/entities/Message";
import * as chatDS from "../datasources/ChatLocalDataSource";
import * as messageDS from "../datasources/MessageLocalDataSource";

/**
 * Local-only ChatRepository implementation.
 *
 * ──── Reads  → from SQLite
 * ──── Writes → to SQLite
 */
export class ChatRepositoryImpl extends ChatRepository {

    // ── Chat Reads ─────────────────────────────────────────────────────

    async getChats(userId) {
        const rows = await chatDS.getAllChats(userId);
        return rows.map((r) => Chat.fromDTO(r));
    }

    async getChatById(id, userId) {
        const row = await chatDS.getChatByLocalId(id, userId);
        if (!row) return null;
        return Chat.fromDTO(row);
    }

    // ── Chat Writes ────────────────────────────────────────────────────

    async createChat(chatData) {
        const row = await chatDS.insertChat(chatData);
        return Chat.fromDTO(row);
    }

    async updateChat(id, changes) {
        const row = await chatDS.updateChatByLocalId(id, changes);
        if (!row) return null;
        return Chat.fromDTO(row);
    }

    async deleteChat(id) {
        // Delete messages first, then the chat
        await messageDS.deleteMessagesByChatId(id);
        await chatDS.deleteChatByLocalId(id);
        return { success: true };
    }

    async clearChats(userId) {
        const normalizedUserId = typeof userId === "string" ? userId.trim() : "";

        if (userId === undefined) {
            await messageDS.deleteAllMessages();
            const deletedCount = await chatDS.deleteAllChats();
            return { success: true, deletedCount };
        }
        if (!normalizedUserId) return { success: true, deletedCount: 0 };

        const scopedChats = await chatDS.getAllChats(normalizedUserId);
        for (const chat of scopedChats) {
            await messageDS.deleteMessagesByChatId(chat.local_id || chat.id);
        }
        const deletedCount = await chatDS.deleteAllChatsByUserId(normalizedUserId);
        return { success: true, deletedCount };
    }

    // ── Message Reads ──────────────────────────────────────────────────

    async getMessages(chatId) {
        const rows = await messageDS.getMessagesByChatId(chatId);
        return rows.map((r) => Message.fromDTO(r));
    }

    // ── Message Writes ─────────────────────────────────────────────────

    async sendMessage(messageData) {
        const row = await messageDS.insertMessage(messageData);
        return Message.fromDTO(row);
    }

    async deleteMessages(chatId) {
        const count = await messageDS.deleteMessagesByChatId(chatId);
        return { success: true, deletedCount: count };
    }
}

export const chatRepository = new ChatRepositoryImpl();
