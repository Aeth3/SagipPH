import { ok, fail } from "../shared/result";

export const MESSAGE_SENDERS = Object.freeze({
    USER: "user",
    BOT: "bot",
    SYSTEM: "system",
});

const VALID_SENDERS = Object.values(MESSAGE_SENDERS);

export class Message {
    constructor({ id, chatId, sender, content, timestamp } = {}) {
        this.id = id;
        this.chatId = chatId;
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
    }

    /**
     * Validate and normalize raw input.
     * Returns ok({ chatId, sender, content }) or fail(...).
     */
    static validateInput(raw = {}) {
        const chatId = typeof raw.chatId === "string" ? raw.chatId.trim() : "";
        const sender = typeof raw.sender === "string" ? raw.sender.trim() : "";
        const content = typeof raw.content === "string" ? raw.content.trim() : "";

        if (!chatId) return fail("VALIDATION_ERROR", "Chat ID is required.");
        if (!sender) return fail("VALIDATION_ERROR", "Sender is required.");
        if (!VALID_SENDERS.includes(sender))
            return fail("VALIDATION_ERROR", `Invalid sender "${sender}". Must be one of: ${VALID_SENDERS.join(", ")}.`);
        if (!content) return fail("VALIDATION_ERROR", "Message content is required.");

        return ok({ chatId, sender, content });
    }

    static fromDTO(raw = {}) {
        return new Message({
            id: raw.id ?? raw.local_id ?? null,
            chatId: raw.chat_id || raw.chatId || null,
            sender: raw.sender ?? "",
            content: raw.content ?? "",
            timestamp: raw.timestamp || raw.created_at || raw.createdAt || null,
        });
    }

    toDTO() {
        return {
            id: this.id,
            chat_id: this.chatId,
            sender: this.sender,
            content: this.content,
            timestamp: this.timestamp,
        };
    }

    isFromUser() {
        return this.sender === MESSAGE_SENDERS.USER;
    }

    isFromBot() {
        return this.sender === MESSAGE_SENDERS.BOT;
    }

    isSystem() {
        return this.sender === MESSAGE_SENDERS.SYSTEM;
    }
}