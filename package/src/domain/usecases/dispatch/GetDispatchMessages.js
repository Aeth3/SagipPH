import { ok, fail } from "../../shared/result";

export const makeGetDispatchMessages = ({ dispatchRepository }) => {
    return async (chatId) => {
        if (!chatId) {
            return fail("INVALID_CHAT_ID", "Chat ID is required");
        }

        try {
            const messages = await dispatchRepository.getMessages(chatId);
            return ok(messages);
        } catch (error) {
            return fail(
                "DISPATCH_MESSAGES_FETCH_ERROR",
                error?.message || "Failed to fetch dispatch messages"
            );
        }
    };
};
