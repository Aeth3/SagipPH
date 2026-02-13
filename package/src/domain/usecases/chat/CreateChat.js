import { ok, fail } from "package/src/domain/shared/result";

export const makeCreateChat = ({ chatRepository }) => {
    return async (data) => {
        try {
            const chat = await chatRepository.createChat(data);
            return ok(chat);
        } catch (error) {
            return fail("CHAT_CREATION_ERROR", error?.message || "Failed to create chat");
        }
    };
};
