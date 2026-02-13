import { ok, fail } from "package/src/domain/shared/result";

export const makeUpdateChat = ({ chatRepository }) => {
    return async (id, changes) => {
        try {
            const chat = await chatRepository.updateChat(id, changes);
            if (!chat) return fail("CHAT_NOT_FOUND", "Chat not found");
            return ok(chat);
        } catch (error) {
            return fail("CHAT_UPDATE_ERROR", error?.message || "Failed to update chat");
        }
    };
};
