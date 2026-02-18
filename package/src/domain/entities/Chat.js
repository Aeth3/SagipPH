import { ok, fail } from "../shared/result";

export class Chat {
    constructor({ id, userId, title, messages = [], createdAt } = {}) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.messages = messages;
        this.createdAt = createdAt;
    }

    /**
     * Validate and normalize raw input (e.g. from a form or API call).
     * Returns ok({ title }) or fail(...).
     */
    static validateInput(raw = {}) {
        const title = typeof raw.title === "string" ? raw.title.trim() : "";

        if (!title) return fail("VALIDATION_ERROR", "Chat title is required.");

        return ok({ title });
    }

    static fromDTO(raw = {}) {
        return new Chat({
            id: raw.id ?? raw.local_id ?? null,
            userId: raw.user_id ?? raw.userId ?? null,
            title: raw.title ?? "",
            messages: Array.isArray(raw.messages) ? raw.messages : [],
            createdAt: raw.created_at || raw.createdAt || null,
        });
    }

    toDTO() {
        return {
            id: this.id,
            user_id: this.userId,
            title: this.title,
            messages: this.messages,
            created_at: this.createdAt,
        };
    }

    hasMessages() {
        return this.messages.length > 0;
    }

    messageCount() {
        return this.messages.length;
    }
}
