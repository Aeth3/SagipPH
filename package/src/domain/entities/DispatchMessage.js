const ALLOWED_STATUS = ["pending", "sent", "failed"];

export class DispatchMessage {
    constructor({
        id,
        chatId,
        content = null,
        timestamp = Date.now(),
        type,
        geotag = null,
        status = "pending",
    }) {
        this.#validate({ id, chatId, type, geotag, status });

        this.id = id;
        this.chatId = chatId;
        this.content = content;
        this.timestamp = new Date(timestamp);
        this.type = type;
        this.geotag = geotag;
        this.status = status;

        Object.freeze(this);
    }

    // -------------------------
    // Validation
    // -------------------------
    #validate({ id, chatId, type, geotag, status }) {
        if (!id) throw new Error("DispatchMessage: id is required");
        if (!chatId) throw new Error("DispatchMessage: chatId is required");
        if (!type) throw new Error("DispatchMessage: type is required");
        if (!geotag) throw new Error("DispatchMessage: geotag is required");

        if (!ALLOWED_STATUS.includes(status)) {
            throw new Error(`DispatchMessage: invalid status '${status}'`);
        }
    }

    // -------------------------
    // Serialization
    // -------------------------
    toJSON() {
        return {
            id: this.id,
            chatId: this.chatId,
            content: this.content,
            timestamp: this.timestamp.toISOString(),
            type: this.type,
            geotag: this.geotag,
            status: this.status, // ⭐ FIX
        };
    }

    static fromJSON(json) {
        return new DispatchMessage({
            id: json.id,
            chatId: json.chatId,
            content: json.content,
            timestamp: json.timestamp,
            type: json.type,
            geotag: json.geotag,
            status: json.status ?? "pending", // ⭐ FIX
        });
    }

    // -------------------------
    // State transitions (immutable)
    // -------------------------
    markSent() {
        return new DispatchMessage({ ...this, status: "sent" });
    }

    markFailed() {
        return new DispatchMessage({ ...this, status: "failed" });
    }

    // -------------------------
    // Factory Helpers
    // -------------------------
    static createText(chatId, content) {
        return new DispatchMessage({
            id: crypto.randomUUID(),
            chatId,
            content,
            type: "text",
            geotag: { lat: null, lng: null }, // ensure validation passes
            status: "pending",
        });
    }

    static createLocation(chatId, { lat, lng, address = null }) {
        return new DispatchMessage({
            id: crypto.randomUUID(),
            chatId,
            type: "location",
            geotag: { lat, lng, address },
            status: "pending",
        });
    }
}
