import { fail, ok } from "package/src/domain/shared/result";

export const makeClearChats = ({ chatRepository }) => {
    return async () => {
        try {
            const result = await chatRepository.clearChats();
            return ok(result);
        } catch (error) {
            return fail("CHAT_CLEAR_ERROR", error?.message || "Failed to clear chats");
        }
    };
};
