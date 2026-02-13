import { fail, ok } from "package/src/domain/shared/result";

export const makeDeleteChat = ({ chatRepository }) => {
    return async (id) => {
        try {
            await chatRepository.deleteChat(id);
            return ok(null);
        } catch (error) {
            return fail("CHAT_DELETION_ERROR", error?.message || "Failed to delete chat");
        }
    };
};
