const listeners = new Set();

let messagesByChat = {};
// { [chatId]: DispatchMessage[] }

const notify = () => {
    listeners.forEach((l) => {
        try {
            l(messagesByChat);
        } catch (_) { }
    });
};

// -------------------------
// PUBLIC API
// -------------------------

export const subscribeToDispatchMessages = (listener) => {
    listeners.add(listener);
    listener(messagesByChat);
    return () => listeners.delete(listener);
};

export const getMessagesForChat = (chatId) => {
    return messagesByChat[chatId] ?? [];
};

// -------------------------
// MUTATIONS (domain-only)
// -------------------------

export const addMessage = (message) => {
    const chatId = message.chatId;

    if (!messagesByChat[chatId]) {
        messagesByChat[chatId] = [];
    }

    messagesByChat[chatId] = [...messagesByChat[chatId], message];
    notify();
};

export const updateMessageStatus = (messageId, updater) => {
    for (const chatId in messagesByChat) {
        messagesByChat[chatId] = messagesByChat[chatId].map((msg) =>
            msg.id === messageId ? { ...msg, ...updater } : msg
        );
    }

    notify();
};

export const setMessagesForChat = (chatId, messages) => {
    messagesByChat[chatId] = messages;
    notify();
};

export const clearDispatchStore = () => {
    messagesByChat = {};
    notify();
};
