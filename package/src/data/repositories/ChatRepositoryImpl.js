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

    async getChats() {
        const rows = await chatDS.getAllChats();
        return rows.map((r) => Chat.fromDTO(r));
    }

    async getChatById(id) {
        const row = await chatDS.getChatByLocalId(id);
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
