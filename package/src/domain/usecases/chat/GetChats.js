import { fail, ok } from "package/src/domain/shared/result";

export const makeGetChats = ({ chatRepository }) => {
    return async () => {
        try {
            const chats = await chatRepository.getChats();
            return ok(chats);
        } catch (error) {
            return fail("CHAT_GETTING_ERROR", error?.message || "Failed to get chats");
        }
    };
};
