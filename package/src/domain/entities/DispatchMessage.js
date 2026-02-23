const ALLOWED_STATUS = ["pending", "sent", "failed"];
const ALLOWED_TYPES = ["text", "location", "CHAT", "SMS"];
const createDispatchId = () =>
    `dispatch_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

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

    #validate({ id, chatId, type, geotag, status }) {
        if (!id) throw new Error("DispatchMessage: id is required");
        if (!chatId) throw new Error("DispatchMessage: chatId is required");
        if (!type) throw new Error("DispatchMessage: type is required");

        if (!ALLOWED_TYPES.includes(type)) {
            throw new Error(`DispatchMessage: invalid type '${type}'`);
        }

        if (type === "location" && !geotag) {
            throw new Error("DispatchMessage: geotag is required for location messages");
        }

        if (!ALLOWED_STATUS.includes(status)) {
            throw new Error(`DispatchMessage: invalid status '${status}'`);
        }
    }

    toJSON() {
        return {
            id: this.id,
            chatId: this.chatId,
            content: this.content,
            timestamp: this.timestamp.toISOString(),
            type: this.type,
            geotag: this.geotag,
            status: this.status,
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
            status: json.status ?? "pending",
        });
    }

    markSent() {
        return new DispatchMessage({ ...this, status: "sent" });
    }

    markFailed() {
        return new DispatchMessage({ ...this, status: "failed" });
    }

    static createText(chatId, content) {
        return new DispatchMessage({
            id: createDispatchId(),
            chatId,
            content,
            type: "text",
            status: "pending",
        });
    }

    static createLocation(chatId, { lat, lng, address = null }) {
        return new DispatchMessage({
            id: createDispatchId(),
            chatId,
            type: "location",
            geotag: { lat, lng, address },
            status: "pending",
        });
    }
}
