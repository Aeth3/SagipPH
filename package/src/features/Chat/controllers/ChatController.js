import { sendDispatchMessage } from "../../../composition/dispatch/dispatchMessage";
import { useState, useRef, useCallback, useEffect } from "react";
import {
    sendChatPrompt,
    resetChatConversation,
    generateChatTitleFromContext,
    extractDispatchState,
} from "../../../composition/chat/chatAssistant";
import {
    getChats,
    createChat,
    updateChat,
    getMessages as fetchMessages,
    sendMessage as persistMessage,
} from "../../../composition/chat/chat";
import { getSession } from "../../../composition/auth/authSession";
import { MESSAGE_SENDERS } from "../../../domain/entities/Message";
import {
    buildConfirmedDispatchBlock,
    parseDispatchFromReply,
    validateDispatchContent,
} from "package/lib/helpers";
import { getCurrentLocation } from "../../../composition/system/location";
import useLiveLocation from "package/src/presentation/hooks/useLiveLocation";
/**
 * ChatController - manages conversation state, AI communication,
 * and SQLite persistence via the composition layer.
 */
export default function useChatController() {
    const [dispatchStatus, setDispatchStatus] = useState(null); // null | "success" | "error"
    const [dispatchGeotag, setDispatchGeotag] = useState(null);
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [chatTitle, setChatTitle] = useState("SagipPH Chat");
    const [currentUserId, setCurrentUserId] = useState(null);
    const scrollViewRef = useRef(null);
    const messagesRef = useRef([]);
    const chatTitleRef = useRef("SagipPH Chat");
    const [showDispatchStatus, setShowDispatchStatus] = useState({ show: false, details: null });
    const scrollToEnd = useCallback(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd?.({ animated: true });
        }, 100);
    }, []);
    const {
        permissionStatus,
        requestPermission,
    } = useLiveLocation();

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        chatTitleRef.current = chatTitle;
    }, [chatTitle]);
    // Bootstrap: load or create a chat on mount
    useEffect(() => {
        const init = async () => {
            try {
                const session = await getSession();
                const userId = session?.ok
                    ? (
                        session?.value?.user?.id ??
                        session?.value?.data?.user?.id ??
                        null
                    )
                    : null;
                setCurrentUserId(userId);
                const chatsResult = await getChats(userId);
                let activeChat = null;

                if (chatsResult.ok && chatsResult.value.length > 0) {
                    // Resume the most recent chat
                    activeChat = chatsResult.value[0];
                } else {
                    // First launch - create a default chat
                    const createResult = await createChat({ title: "SagipPH Chat", userId });
                    if (createResult.ok) activeChat = createResult.value;
                }

                if (activeChat) {
                    setChatId(activeChat.id);
                    setChatTitle(activeChat.title || "SagipPH Chat");

                    // Load persisted messages
                    const messagesResult = await fetchMessages(activeChat.id);
                    if (messagesResult.ok && messagesResult.value.length > 0) {
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

    // Persist a single message to SQLite
    const persist = useCallback(
        async (sender, content) => {
            if (!chatId) return;
            await persistMessage({ chatId, sender, content });
        },
        [chatId]
    );

    // Send a message
    const send = useCallback(
        async (text) => {
            const trimmed = text.trim();
            if (!trimmed || isLoading) return;
            // 🔒 HARD LOCATION ENFORCEMENT
            console.log("permissionStatus", permissionStatus);

            if (permissionStatus !== "granted") {
                const latest = await requestPermission();

                if (latest !== "granted") {
                    console.warn("Location not granted. Blocking chat.");
                    return; // 🚫 BLOCK CHAT HERE
                }
            }
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
                const currentMessages = messagesRef.current;
                const reply = await sendChatPrompt(trimmed);
                const extractionContext = [...currentMessages, userMsg, { role: "assistant", text: reply }];
                const extracted = await extractDispatchState(extractionContext);
                const extractedValidation = validateDispatchContent(extracted?.content);
                const canDispatchFromExtraction = extracted?.ready && extractedValidation.ready;
                const hasConfirmedDispatch = /CONFIRMED_DISPATCH/i.test(reply);

                let finalReply = reply;
                if (canDispatchFromExtraction && !hasConfirmedDispatch) {
                    const confirmedBlock = buildConfirmedDispatchBlock(extractedValidation.content);
                    finalReply = `${reply.trim()}\n\n${confirmedBlock}`;
                }

                const assistantMsg = {
                    id: `local_${Date.now()}_bot`,
                    role: "assistant",
                    text: finalReply,
                    timestamp: Date.now(),
                };

                setMessages((prev) => [...prev, assistantMsg]);

                // Persist bot reply
                persist(MESSAGE_SENDERS.BOT, finalReply);

                // Prefer structured extraction; fall back to text parser
                let payload = null;
                if (canDispatchFromExtraction) {
                    payload = {
                        id: `dispatch_${Date.now()}`,
                        chatId,
                        type: "dispatch",
                        content: extractedValidation.content,
                    };
                } else {
                    const parsedPayload = parseDispatchFromReply(finalReply, chatId);
                    const parsedValidation = validateDispatchContent(parsedPayload?.content);
                    payload = parsedValidation.ready
                        ? { ...parsedPayload, content: parsedValidation.content }
                        : null;
                }

                if (payload) {
                    try {
                        let gps = null;

                        try {
                            gps = await getCurrentLocation();
                        } catch (e) {
                            console.warn("GPS unavailable. Blocking dispatch.");
                            setDispatchStatus("error");
                            return; // 🚫 BLOCK if location service OFF
                        }

                        if (!gps?.latitude) {
                            console.warn("Invalid GPS data. Blocking dispatch.");
                            setDispatchStatus("error");
                            return;
                        }

                        payload.geotag = {
                            lat: gps.latitude,
                            lng: gps.longitude,
                            accuracy: gps.accuracy,
                        };
                        setDispatchGeotag(payload.geotag);
                        payload.rawData = finalReply;
                        payload.type = "CHAT"
                        console.log("payload", payload);

                    } catch (e) {
                        console.warn("GPS unavailable:", e.message);
                    }
                    // setShowDispatchStatus({ ...showDispatchStatus, show: true, details: payload });
                    const result = await sendDispatchMessage(payload);
                    console.log("result", result);

                    if (result.ok) {
                        setShowDispatchStatus((prev) => ({ ...prev, show: true, details: payload }));
                    }
                    if (result.ok) setDispatchStatus("success");
                    else setDispatchStatus("error");
                } else {
                    setDispatchStatus(null);
                    setDispatchGeotag(null);
                }

                // Refresh title based on recent chat context.
                if (chatId) {
                    const generatedTitle = await generateChatTitleFromContext([
                        ...currentMessages,
                        userMsg,
                        assistantMsg,
                    ]);
                    if (generatedTitle && generatedTitle !== chatTitleRef.current) {
                        setChatTitle(generatedTitle);
                        updateChat(chatId, { title: generatedTitle });
                    }
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
                console.warn("[ChatController] Chat service error:", error);
            } finally {
                setIsLoading(false);
                scrollToEnd();
            }
        },
        [chatId, isLoading, permissionStatus, persist, requestPermission, scrollToEnd]
    );

    // Load an existing chat by ID (from chat history)
    const loadChat = useCallback(async (targetChatId) => {
        try {
            const chatsResult = await getChats(currentUserId);
            const chat = chatsResult.ok
                ? chatsResult.value.find((c) => c.id === targetChatId)
                : null;
            if (!chat) return;

            setMessages([]);
            resetChatConversation();
            setChatId(targetChatId);
            setChatTitle(chat.title || "SagipPH Chat");

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
        } catch (err) {
            console.warn("[ChatController] loadChat error:", err);
        }
    }, [currentUserId]);

    // Clear conversation
    const clearChat = useCallback(async () => {
        setMessages([]);
        resetChatConversation();
        setChatTitle("SagipPH Chat");
        setShowDispatchStatus((prev) => ({ ...prev, show: false, details: null }));
        setDispatchGeotag(null);

        // Keep previous chats for history; just create and switch to a fresh one.
        const createResult = await createChat({ title: "SagipPH Chat", userId: currentUserId });
        if (createResult.ok) {
            setChatId(createResult.value.id);
        }
    }, [currentUserId]);

    return {
        messages,
        isLoading,
        isReady,
        chatTitle,
        send,
        clearChat,
        loadChat,
        scrollViewRef,
        dispatchStatus,
        showDispatchStatus,
        dispatchGeotag,
    };
}
