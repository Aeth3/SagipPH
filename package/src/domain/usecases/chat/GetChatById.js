import { fail, ok } from "package/src/domain/shared/result";

export const makeGetChatById = ({ chatRepository }) => {
    return async (id) => {
        try {
            const chat = await chatRepository.getChatById(id);
            return ok(chat);
        } catch (error) {
            return fail("CHAT_GETTING_ERROR", error?.message || "Failed to get chat by id");
        }
    };
};
