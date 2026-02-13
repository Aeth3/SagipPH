import { useState, useRef, useCallback } from "react";
import { sendMessage, resetChat } from "../../../services/geminiService";

/**
 * @typedef {"user"|"assistant"} Role
 * @typedef {{id: string, role: Role, text: string, timestamp: number}} ChatMessage
 */

let nextId = 1;
const makeId = () => `msg_${nextId++}`;

/**
 * ChatController — manages conversation state and Gemini communication.
 * Returns everything the ChatScreen needs to render and interact.
 */
export default function useChatController() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef(null);

    const scrollToEnd = useCallback(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd?.({ animated: true });
        }, 100);
    }, []);

    const send = useCallback(
        async (text) => {
            const trimmed = text.trim();
            if (!trimmed || isLoading) return;

            // Add user message
            const userMsg = {
                id: makeId(),
                role: "user",
                text: trimmed,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setIsLoading(true);
            scrollToEnd();

            try {
                const reply = await sendMessage(trimmed);

                const assistantMsg = {
                    id: makeId(),
                    role: "assistant",
                    text: reply,
                    timestamp: Date.now(),
                };

                setMessages((prev) => [...prev, assistantMsg]);
            } catch (error) {
                const isQuota =
                    error?.message?.includes("429") ||
                    error?.message?.includes("quota");

                const errorMsg = {
                    id: makeId(),
                    role: "assistant",
                    text: isQuota
                        ? "I'm temporarily unavailable due to high demand. Please wait a moment and try again."
                        : "Sorry, I couldn't process that right now. Please try again.",
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
        [isLoading, scrollToEnd]
    );

    const clearChat = useCallback(() => {
        setMessages([]);
        resetChat();
    }, []);

    return {
        messages,
        isLoading,
        send,
        clearChat,
        scrollViewRef,
    };
}
