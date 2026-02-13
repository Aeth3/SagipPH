import { useState, useRef, useCallback, useEffect } from "react";
import { sendMessage as sendGeminiMessage, resetChat as resetGeminiChat, generateChatTitle } from "../../../services/geminiService";
import {
    getChats,
    createChat,
    updateChat,
    deleteChat,
    getMessages as fetchMessages,
    sendMessage as persistMessage,
} from "../../../composition/chat";
import { MESSAGE_SENDERS } from "../../../domain/entities/Message";

/**
 * ChatController — manages conversation state, Gemini communication,
 * and SQLite persistence via the composition layer.
 */
export default function useChatController() {
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [chatTitle, setChatTitle] = useState("SagipPH Chat");
    const scrollViewRef = useRef(null);
    const titleGenerated = useRef(false);

    const scrollToEnd = useCallback(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd?.({ animated: true });
        }, 100);
    }, []);

    // ── Bootstrap: load or create a chat on mount ──────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const chatsResult = await getChats();
                let activeChat = null;

                if (chatsResult.ok && chatsResult.value.length > 0) {
                    // Resume the most recent chat
                    activeChat = chatsResult.value[0];
                } else {
                    // First launch — create a default chat
                    const createResult = await createChat({ title: "SagipPH Chat" });
                    if (createResult.ok) activeChat = createResult.value;
                }

                if (activeChat) {
                    setChatId(activeChat.id);
                    setChatTitle(activeChat.title || "SagipPH Chat");

                    // Load persisted messages
                    const messagesResult = await fetchMessages(activeChat.id);
                    if (messagesResult.ok && messagesResult.value.length > 0) {
                        // Chat already has messages — title was already generated
                        titleGenerated.current = true;
                        const restored = messagesResult.value.map((m) => ({
                            id: m.id,
                            role: m.sender === MESSAGE_SENDERS.USER ? "user" : "assistant",
                            text: m.content,
                            timestamp: m.timestamp,
                        }));
                        setMessages(restored);
                    }
                }
            } catch (err) {
                console.warn("[ChatController] Init error:", err);
            } finally {
                setIsReady(true);
            }
        };
        init();
    }, []);

    // ── Persist a single message to SQLite ─────────────────────────────
    const persist = useCallback(
        async (sender, content) => {
            if (!chatId) return;
            await persistMessage({ chatId, sender, content });
        },
        [chatId]
    );

    // ── Send a message ────────────────────────────────────────────────
    const send = useCallback(
        async (text) => {
            const trimmed = text.trim();
            if (!trimmed || isLoading) return;

            // Optimistic user message
            const userMsg = {
                id: `local_${Date.now()}`,
                role: "user",
                text: trimmed,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setIsLoading(true);
            scrollToEnd();

            // Persist user message
            persist(MESSAGE_SENDERS.USER, trimmed);

            try {
                const reply = await sendGeminiMessage(trimmed);

                const assistantMsg = {
                    id: `local_${Date.now()}_bot`,
                    role: "assistant",
                    text: reply,
                    timestamp: Date.now(),
                };

                setMessages((prev) => [...prev, assistantMsg]);

                // Persist bot reply
                persist(MESSAGE_SENDERS.BOT, reply);

                // Generate a dynamic title after the first exchange
                if (!titleGenerated.current && chatId) {
                    titleGenerated.current = true;
                    const generatedTitle = await generateChatTitle(trimmed, reply);
                    setChatTitle(generatedTitle);
                    updateChat(chatId, { title: generatedTitle });
                }
            } catch (error) {
                const isQuota =
                    error?.message?.includes("429") ||
                    error?.message?.includes("quota");

                const errorText = isQuota
                    ? "I'm temporarily unavailable due to high demand. Please wait a moment and try again."
                    : "Sorry, I couldn't process that right now. Please try again.";

                const errorMsg = {
                    id: `local_${Date.now()}_err`,
                    role: "assistant",
                    text: errorText,
                    timestamp: Date.now(),
                    isError: true,
                };

                setMessages((prev) => [...prev, errorMsg]);
                console.warn("[ChatController] Gemini error:", error);
            } finally {
                setIsLoading(false);
                scrollToEnd();
            }
        },
        [isLoading, scrollToEnd, persist, chatId]
    );

    // ── Load an existing chat by ID (from chat history) ────────────
    const loadChat = useCallback(async (targetChatId) => {
        try {
            setMessages([]);
            resetGeminiChat();
            setChatId(targetChatId);
            titleGenerated.current = true;

            const messagesResult = await fetchMessages(targetChatId);
            if (messagesResult.ok && messagesResult.value.length > 0) {
                const restored = messagesResult.value.map((m) => ({
                    id: m.id,
                    role: m.sender === MESSAGE_SENDERS.USER ? "user" : "assistant",
                    text: m.content,
                    timestamp: m.timestamp,
                }));
                setMessages(restored);
            }

            // Update title from DB
            const chatsResult = await getChats();
            if (chatsResult.ok) {
                const chat = chatsResult.value.find((c) => c.id === targetChatId);
                if (chat) setChatTitle(chat.title || "SagipPH Chat");
            }
        } catch (err) {
            console.warn("[ChatController] loadChat error:", err);
        }
    }, []);

    // ── Clear conversation ────────────────────────────────────────────
    const clearChat = useCallback(async () => {
        setMessages([]);
        resetGeminiChat();
        titleGenerated.current = false;
        setChatTitle("SagipPH Chat");

        // Delete the old chat and create a fresh one
        if (chatId) {
            await deleteChat(chatId);
        }
        const createResult = await createChat({ title: "SagipPH Chat" });
        if (createResult.ok) {
            setChatId(createResult.value.id);
        }
    }, [chatId]);

    return {
        messages,
        isLoading,
        isReady,
        chatTitle,
        send,
        clearChat,
        loadChat,
        scrollViewRef,
    };
}
