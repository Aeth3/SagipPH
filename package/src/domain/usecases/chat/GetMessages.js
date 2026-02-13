import { fail, ok } from "package/src/domain/shared/result";

export const makeGetMessages = ({ chatRepository }) => {
    return async (chatId) => {
        try {
            const messages = await chatRepository.getMessages(chatId);
            return ok(messages);
        } catch (error) {
            return fail("MESSAGE_GETTING_ERROR", error?.message || "Failed to get messages");
        }
    };
};
