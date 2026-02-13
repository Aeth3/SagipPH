import React from "react";
import renderer, { act } from "react-test-renderer";
import useChatController from "../../../package/src/features/Chat/controllers/ChatController";

/* ── Mocks ─────────────────────────────────────────────── */

const mockSendGeminiMessage = jest.fn();
const mockResetGeminiChat = jest.fn();
const mockGenerateChatTitle = jest.fn();
jest.mock("../../../package/src/services/geminiService", () => ({
    sendMessage: (...args) => mockSendGeminiMessage(...args),
    resetChat: (...args) => mockResetGeminiChat(...args),
    generateChatTitle: (...args) => mockGenerateChatTitle(...args),
}));

const mockGetChats = jest.fn();
const mockCreateChat = jest.fn();
const mockUpdateChat = jest.fn();
const mockDeleteChat = jest.fn();
const mockGetMessages = jest.fn();
const mockPersistMessage = jest.fn();
jest.mock("../../../package/src/composition/chat", () => ({
    getChats: (...args) => mockGetChats(...args),
    createChat: (...args) => mockCreateChat(...args),
    updateChat: (...args) => mockUpdateChat(...args),
    deleteChat: (...args) => mockDeleteChat(...args),
    getMessages: (...args) => mockGetMessages(...args),
    sendMessage: (...args) => mockPersistMessage(...args),
}));

jest.mock("../../../package/src/domain/entities/Message", () => ({
    MESSAGE_SENDERS: { USER: "user", BOT: "bot", SYSTEM: "system" },
}));

/* ── Harness ───────────────────────────────────────────── */

const setupHook = async (overrides = {}) => {
    // Default: no existing chats → creates one
    const defaults = {
        getChats: { ok: true, value: [] },
        createChat: { ok: true, value: { id: "new-chat-1" } },
        getMessages: { ok: true, value: [] },
    };
    const opts = { ...defaults, ...overrides };

    mockGetChats.mockResolvedValue(opts.getChats);
    mockCreateChat.mockResolvedValue(opts.createChat);
    mockUpdateChat.mockResolvedValue({ ok: true });
    mockGetMessages.mockResolvedValue(opts.getMessages);
    mockPersistMessage.mockResolvedValue({ ok: true });
    mockGenerateChatTitle.mockResolvedValue("Generated Title");

    // Use a ref-like object so we always read the latest hook state
    const ref = { current: null };
    function Harness() {
        ref.current = useChatController();
        return null;
    }

    await act(async () => {
        renderer.create(<Harness />);
    });

    return ref;
};

/* ── Tests ─────────────────────────────────────────────── */

describe("useChatController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── Initialization ──────────────────────────────────

    it("creates a new chat when no existing chats", async () => {
        const ref = await setupHook();

        expect(mockGetChats).toHaveBeenCalled();
        expect(mockCreateChat).toHaveBeenCalledWith({ title: "SagipPH Chat" });
        expect(ref.current.messages).toEqual([]);
        expect(ref.current.isLoading).toBe(false);
        expect(ref.current.isReady).toBe(true);
    });

    it("resumes the most recent chat and restores messages", async () => {
        const ref = await setupHook({
            getChats: {
                ok: true,
                value: [{ id: "existing-chat" }],
            },
            getMessages: {
                ok: true,
                value: [
                    { id: "m1", sender: "user", content: "Hello", timestamp: 100 },
                    { id: "m2", sender: "bot", content: "Hi!", timestamp: 200 },
                ],
            },
        });

        expect(mockCreateChat).not.toHaveBeenCalled();
        expect(mockGetMessages).toHaveBeenCalledWith("existing-chat");
        expect(ref.current.messages).toHaveLength(2);
        expect(ref.current.messages[0].role).toBe("user");
        expect(ref.current.messages[0].text).toBe("Hello");
        expect(ref.current.messages[1].role).toBe("assistant");
        expect(ref.current.messages[1].text).toBe("Hi!");
    });

    it("sets isReady to true even when init fails", async () => {
        mockGetChats.mockRejectedValue(new Error("DB error"));
        const ref = await setupHook();
        expect(ref.current.isReady).toBe(true);
    });

    // ── Sending messages ────────────────────────────────

    it("sends a message and receives a reply", async () => {
        mockSendGeminiMessage.mockResolvedValue("Bot reply");
        const ref = await setupHook();

        await act(async () => {
            await ref.current.send("Hello bot");
        });

        // User message + assistant reply
        expect(ref.current.messages).toHaveLength(2);
        expect(ref.current.messages[0].role).toBe("user");
        expect(ref.current.messages[0].text).toBe("Hello bot");
        expect(ref.current.messages[1].role).toBe("assistant");
        expect(ref.current.messages[1].text).toBe("Bot reply");
        expect(ref.current.isLoading).toBe(false);

        // Persisted both messages
        expect(mockPersistMessage).toHaveBeenCalledTimes(2);
        expect(mockPersistMessage).toHaveBeenCalledWith(
            expect.objectContaining({ sender: "user", content: "Hello bot" })
        );
        expect(mockPersistMessage).toHaveBeenCalledWith(
            expect.objectContaining({ sender: "bot", content: "Bot reply" })
        );
    });

    it("ignores empty or whitespace-only messages", async () => {
        const ref = await setupHook();

        await act(async () => {
            await ref.current.send("");
        });
        expect(ref.current.messages).toHaveLength(0);

        await act(async () => {
            await ref.current.send("   ");
        });
        expect(ref.current.messages).toHaveLength(0);

        expect(mockSendGeminiMessage).not.toHaveBeenCalled();
    });

    it("shows generic error message when Gemini throws", async () => {
        mockSendGeminiMessage.mockRejectedValue(new Error("Something broke"));
        const ref = await setupHook();

        await act(async () => {
            await ref.current.send("Hello");
        });

        expect(ref.current.messages).toHaveLength(2);
        expect(ref.current.messages[1].role).toBe("assistant");
        expect(ref.current.messages[1].text).toContain("couldn't process");
        expect(ref.current.messages[1].isError).toBe(true);
        expect(ref.current.isLoading).toBe(false);
    });

    it("shows quota error message on 429 errors", async () => {
        mockSendGeminiMessage.mockRejectedValue(new Error("429 Too Many Requests"));
        const ref = await setupHook();

        await act(async () => {
            await ref.current.send("Hello");
        });

        expect(ref.current.messages[1].text).toContain("temporarily unavailable");
        expect(ref.current.messages[1].isError).toBe(true);
    });

    it("shows quota error message on quota errors", async () => {
        mockSendGeminiMessage.mockRejectedValue(new Error("quota exceeded"));
        const ref = await setupHook();

        await act(async () => {
            await ref.current.send("Hello");
        });

        expect(ref.current.messages[1].text).toContain("temporarily unavailable");
    });

    // ── Clear chat ──────────────────────────────────────

    it("clears messages and creates a fresh chat", async () => {
        mockSendGeminiMessage.mockResolvedValue("Reply");
        mockDeleteChat.mockResolvedValue({ ok: true });
        mockCreateChat.mockResolvedValue({ ok: true, value: { id: "fresh-chat" } });

        const ref = await setupHook();

        // Add a message first
        await act(async () => {
            await ref.current.send("Hi");
        });
        expect(ref.current.messages.length).toBeGreaterThan(0);

        // Clear
        await act(async () => {
            await ref.current.clearChat();
        });

        expect(ref.current.messages).toEqual([]);
        expect(mockResetGeminiChat).toHaveBeenCalled();
        expect(mockDeleteChat).toHaveBeenCalled();
        expect(mockCreateChat).toHaveBeenCalledWith({ title: "SagipPH Chat" });
    });

    // ── Return shape ────────────────────────────────────

    it("exposes the expected API shape", async () => {
        const ref = await setupHook();
        expect(ref.current).toEqual(
            expect.objectContaining({
                messages: expect.any(Array),
                isLoading: expect.any(Boolean),
                isReady: expect.any(Boolean),
                chatTitle: expect.any(String),
                send: expect.any(Function),
                clearChat: expect.any(Function),
                scrollViewRef: expect.objectContaining({ current: null }),
            })
        );
    });

    // ── Dynamic chat title ──────────────────────────────

    it("generates a dynamic title after the first exchange", async () => {
        mockSendGeminiMessage.mockResolvedValue("Bot reply");
        const ref = await setupHook();
        mockGenerateChatTitle.mockResolvedValue("Flood Safety Tips");

        expect(ref.current.chatTitle).toBe("SagipPH Chat");

        await act(async () => {
            await ref.current.send("How to prepare for floods?");
        });

        // Wait for the async title generation to resolve
        await act(async () => { });

        expect(mockGenerateChatTitle).toHaveBeenCalledWith(
            "How to prepare for floods?",
            "Bot reply"
        );
        expect(mockUpdateChat).toHaveBeenCalledWith("new-chat-1", { title: "Flood Safety Tips" });
        expect(ref.current.chatTitle).toBe("Flood Safety Tips");
    });

    it("only generates a title once per chat session", async () => {
        mockSendGeminiMessage.mockResolvedValue("Reply");
        mockGenerateChatTitle.mockResolvedValue("First Title");
        const ref = await setupHook();

        await act(async () => {
            await ref.current.send("First message");
        });
        await act(async () => { });

        await act(async () => {
            await ref.current.send("Second message");
        });
        await act(async () => { });

        expect(mockGenerateChatTitle).toHaveBeenCalledTimes(1);
    });

    it("does not generate a title when resuming a chat with messages", async () => {
        mockSendGeminiMessage.mockResolvedValue("Reply");
        const ref = await setupHook({
            getChats: {
                ok: true,
                value: [{ id: "existing-chat", title: "Old Title" }],
            },
            getMessages: {
                ok: true,
                value: [
                    { id: "m1", sender: "user", content: "Hello", timestamp: 100 },
                    { id: "m2", sender: "bot", content: "Hi!", timestamp: 200 },
                ],
            },
        });

        expect(ref.current.chatTitle).toBe("Old Title");

        await act(async () => {
            await ref.current.send("Another message");
        });
        await act(async () => { });

        expect(mockGenerateChatTitle).not.toHaveBeenCalled();
    });

    it("resets title state on clearChat", async () => {
        mockSendGeminiMessage.mockResolvedValue("Reply");
        mockDeleteChat.mockResolvedValue({ ok: true });
        mockCreateChat.mockResolvedValue({ ok: true, value: { id: "fresh-chat" } });

        const ref = await setupHook();
        mockGenerateChatTitle.mockResolvedValue("Dynamic Title");

        await act(async () => {
            await ref.current.send("Hi");
        });
        await act(async () => { });

        expect(ref.current.chatTitle).toBe("Dynamic Title");

        await act(async () => {
            await ref.current.clearChat();
        });

        expect(ref.current.chatTitle).toBe("SagipPH Chat");

        // Should generate a new title on the next message
        mockGenerateChatTitle.mockClear();
        mockGenerateChatTitle.mockResolvedValue("New Title");

        await act(async () => {
            await ref.current.send("New convo");
        });
        await act(async () => { });

        expect(mockGenerateChatTitle).toHaveBeenCalledTimes(1);
    });
});
