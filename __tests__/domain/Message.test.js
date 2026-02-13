import { Message, MESSAGE_SENDERS } from "../../package/src/domain/entities/Message";

describe("MESSAGE_SENDERS", () => {
    it("contains USER, BOT, and SYSTEM", () => {
        expect(MESSAGE_SENDERS.USER).toBe("user");
        expect(MESSAGE_SENDERS.BOT).toBe("bot");
        expect(MESSAGE_SENDERS.SYSTEM).toBe("system");
    });

    it("is frozen", () => {
        expect(Object.isFrozen(MESSAGE_SENDERS)).toBe(true);
    });
});

describe("Message", () => {
    describe("constructor", () => {
        it("creates a Message with defaults when no args given", () => {
            const msg = new Message();
            expect(msg.id).toBeUndefined();
            expect(msg.chatId).toBeUndefined();
            expect(msg.sender).toBeUndefined();
            expect(msg.content).toBeUndefined();
            expect(msg.timestamp).toBeUndefined();
        });

        it("creates a Message with provided values", () => {
            const msg = new Message({
                id: "m1",
                chatId: "c1",
                sender: "user",
                content: "Hello",
                timestamp: 12345,
            });
            expect(msg.id).toBe("m1");
            expect(msg.chatId).toBe("c1");
            expect(msg.sender).toBe("user");
            expect(msg.content).toBe("Hello");
            expect(msg.timestamp).toBe(12345);
        });
    });

    describe("validateInput", () => {
        it("returns ok with valid input", () => {
            const result = Message.validateInput({
                chatId: "c1",
                sender: "user",
                content: "Hello",
            });
            expect(result.ok).toBe(true);
            expect(result.value).toEqual({
                chatId: "c1",
                sender: "user",
                content: "Hello",
            });
        });

        it("trims whitespace from all fields", () => {
            const result = Message.validateInput({
                chatId: "  c1  ",
                sender: "  bot  ",
                content: "  Hi  ",
            });
            expect(result.ok).toBe(true);
            expect(result.value).toEqual({
                chatId: "c1",
                sender: "bot",
                content: "Hi",
            });
        });

        it("fails when chatId is missing", () => {
            const result = Message.validateInput({ sender: "user", content: "Hi" });
            expect(result.ok).toBe(false);
            expect(result.error.message).toBe("Chat ID is required.");
        });

        it("fails when sender is missing", () => {
            const result = Message.validateInput({ chatId: "c1", content: "Hi" });
            expect(result.ok).toBe(false);
            expect(result.error.message).toBe("Sender is required.");
        });

        it("fails when sender is invalid", () => {
            const result = Message.validateInput({
                chatId: "c1",
                sender: "alien",
                content: "Hi",
            });
            expect(result.ok).toBe(false);
            expect(result.error.message).toContain('Invalid sender "alien"');
            expect(result.error.message).toContain("user");
            expect(result.error.message).toContain("bot");
            expect(result.error.message).toContain("system");
        });

        it("fails when content is missing", () => {
            const result = Message.validateInput({ chatId: "c1", sender: "user" });
            expect(result.ok).toBe(false);
            expect(result.error.message).toBe("Message content is required.");
        });

        it("fails when content is empty string", () => {
            const result = Message.validateInput({
                chatId: "c1",
                sender: "user",
                content: "",
            });
            expect(result.ok).toBe(false);
            expect(result.error.message).toBe("Message content is required.");
        });

        it("fails when called with no arguments", () => {
            const result = Message.validateInput();
            expect(result.ok).toBe(false);
        });

        it("accepts all valid senders", () => {
            for (const sender of ["user", "bot", "system"]) {
                const result = Message.validateInput({
                    chatId: "c1",
                    sender,
                    content: "test",
                });
                expect(result.ok).toBe(true);
            }
        });
    });

    describe("fromDTO", () => {
        it("maps standard DTO fields", () => {
            const msg = Message.fromDTO({
                id: "m1",
                chat_id: "c1",
                sender: "user",
                content: "Hello",
                timestamp: 100,
            });
            expect(msg.id).toBe("m1");
            expect(msg.chatId).toBe("c1");
            expect(msg.sender).toBe("user");
            expect(msg.content).toBe("Hello");
            expect(msg.timestamp).toBe(100);
        });

        it("falls back to local_id when id is absent", () => {
            const msg = Message.fromDTO({ local_id: "local_m1" });
            expect(msg.id).toBe("local_m1");
        });

        it("falls back to chatId when chat_id is absent", () => {
            const msg = Message.fromDTO({ chatId: "c2" });
            expect(msg.chatId).toBe("c2");
        });

        it("falls back to created_at / createdAt for timestamp", () => {
            expect(Message.fromDTO({ created_at: "2025-01-01" }).timestamp).toBe("2025-01-01");
            expect(Message.fromDTO({ createdAt: "2025-02-01" }).timestamp).toBe("2025-02-01");
        });

        it("defaults gracefully when called with no arguments", () => {
            const msg = Message.fromDTO();
            expect(msg.id).toBeNull();
            expect(msg.chatId).toBeNull();
            expect(msg.sender).toBe("");
            expect(msg.content).toBe("");
            expect(msg.timestamp).toBeNull();
        });
    });

    describe("toDTO", () => {
        it("serializes to DTO format", () => {
            const msg = new Message({
                id: "m1",
                chatId: "c1",
                sender: "user",
                content: "Hello",
                timestamp: 100,
            });
            expect(msg.toDTO()).toEqual({
                id: "m1",
                chat_id: "c1",
                sender: "user",
                content: "Hello",
                timestamp: 100,
            });
        });
    });

    describe("role helpers", () => {
        it("isFromUser returns true for user sender", () => {
            const msg = new Message({ sender: MESSAGE_SENDERS.USER });
            expect(msg.isFromUser()).toBe(true);
            expect(msg.isFromBot()).toBe(false);
            expect(msg.isSystem()).toBe(false);
        });

        it("isFromBot returns true for bot sender", () => {
            const msg = new Message({ sender: MESSAGE_SENDERS.BOT });
            expect(msg.isFromUser()).toBe(false);
            expect(msg.isFromBot()).toBe(true);
            expect(msg.isSystem()).toBe(false);
        });

        it("isSystem returns true for system sender", () => {
            const msg = new Message({ sender: MESSAGE_SENDERS.SYSTEM });
            expect(msg.isFromUser()).toBe(false);
            expect(msg.isFromBot()).toBe(false);
            expect(msg.isSystem()).toBe(true);
        });
    });
});
