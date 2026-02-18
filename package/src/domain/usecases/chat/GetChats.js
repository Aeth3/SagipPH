import { fail, ok } from "package/src/domain/shared/result";

export const makeGetChats = ({ chatRepository }) => {
    return async (userId) => {
        try {
            const chats = await chatRepository.getChats(userId);
            return ok(chats);
        } catch (error) {
            return fail("CHAT_GETTING_ERROR", error?.message || "Failed to get chats");
        }
    };
};
