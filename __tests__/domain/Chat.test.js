import { Chat } from "../../package/src/domain/entities/Chat";

describe("Chat", () => {
    describe("constructor", () => {
        it("creates a Chat with defaults when no args given", () => {
            const chat = new Chat();
            expect(chat.id).toBeUndefined();
            expect(chat.title).toBeUndefined();
            expect(chat.messages).toEqual([]);
            expect(chat.createdAt).toBeUndefined();
        });

        it("creates a Chat with provided values", () => {
            const chat = new Chat({
                id: "c1",
                title: "Help chat",
                messages: [{ id: "m1" }],
                createdAt: "2025-01-01",
            });
            expect(chat.id).toBe("c1");
            expect(chat.title).toBe("Help chat");
            expect(chat.messages).toEqual([{ id: "m1" }]);
            expect(chat.createdAt).toBe("2025-01-01");
        });
    });

    describe("validateInput", () => {
        it("returns ok with trimmed title", () => {
            const result = Chat.validateInput({ title: "  My Chat  " });
            expect(result.ok).toBe(true);
            expect(result.value).toEqual({ title: "My Chat" });
        });

        it("fails when title is empty string", () => {
            const result = Chat.validateInput({ title: "" });
            expect(result.ok).toBe(false);
            expect(result.error.code).toBe("VALIDATION_ERROR");
            expect(result.error.message).toBe("Chat title is required.");
        });

        it("fails when title is missing", () => {
            const result = Chat.validateInput({});
            expect(result.ok).toBe(false);
            expect(result.error.message).toBe("Chat title is required.");
        });

        it("fails when title is only whitespace", () => {
            const result = Chat.validateInput({ title: "   " });
            expect(result.ok).toBe(false);
            expect(result.error.message).toBe("Chat title is required.");
        });

        it("fails when title is not a string", () => {
            const result = Chat.validateInput({ title: 123 });
            expect(result.ok).toBe(false);
            expect(result.error.message).toBe("Chat title is required.");
        });

        it("fails when called with no arguments", () => {
            const result = Chat.validateInput();
            expect(result.ok).toBe(false);
        });
    });

    describe("fromDTO", () => {
        it("maps standard fields", () => {
            const chat = Chat.fromDTO({
                id: "c1",
                title: "Test",
                messages: [1, 2],
                created_at: "2025-06-01",
            });
            expect(chat.id).toBe("c1");
            expect(chat.title).toBe("Test");
            expect(chat.messages).toEqual([1, 2]);
            expect(chat.createdAt).toBe("2025-06-01");
        });

        it("falls back to local_id when id is absent", () => {
            const chat = Chat.fromDTO({ local_id: "local_1" });
            expect(chat.id).toBe("local_1");
        });

        it("falls back to createdAt when created_at is absent", () => {
            const chat = Chat.fromDTO({ createdAt: "2025-07-01" });
            expect(chat.createdAt).toBe("2025-07-01");
        });

        it("defaults to empty array when messages is not an array", () => {
            const chat = Chat.fromDTO({ messages: "not an array" });
            expect(chat.messages).toEqual([]);
        });

        it("defaults gracefully when called with no arguments", () => {
            const chat = Chat.fromDTO();
            expect(chat.id).toBeNull();
            expect(chat.title).toBe("");
            expect(chat.messages).toEqual([]);
            expect(chat.createdAt).toBeNull();
        });
    });

    describe("toDTO", () => {
        it("serializes to DTO format", () => {
            const chat = new Chat({
                id: "c1",
                title: "Test",
                messages: [1],
                createdAt: "2025-01-01",
            });
            expect(chat.toDTO()).toEqual({
                id: "c1",
                title: "Test",
                messages: [1],
                created_at: "2025-01-01",
            });
        });
    });

    describe("hasMessages", () => {
        it("returns false when messages is empty", () => {
            const chat = new Chat({ messages: [] });
            expect(chat.hasMessages()).toBe(false);
        });

        it("returns true when messages exist", () => {
            const chat = new Chat({ messages: [{ id: "m1" }] });
            expect(chat.hasMessages()).toBe(true);
        });
    });

    describe("messageCount", () => {
        it("returns 0 for no messages", () => {
            const chat = new Chat({ messages: [] });
            expect(chat.messageCount()).toBe(0);
        });

        it("returns correct count", () => {
            const chat = new Chat({ messages: [1, 2, 3] });
            expect(chat.messageCount()).toBe(3);
        });
    });
});
