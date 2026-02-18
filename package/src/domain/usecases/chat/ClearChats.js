import { fail, ok } from "package/src/domain/shared/result";

export const makeClearChats = ({ chatRepository }) => {
    return async (userId) => {
        try {
            const result = await chatRepository.clearChats(userId);
            return ok(result);
        } catch (error) {
            return fail("CHAT_CLEAR_ERROR", error?.message || "Failed to clear chats");
        }
    };
};
