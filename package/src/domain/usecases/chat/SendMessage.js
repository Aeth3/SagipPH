import { ok, fail } from "package/src/domain/shared/result";

export const makeSendMessage = ({ chatRepository }) => {
    return async (data) => {
        try {
            const message = await chatRepository.sendMessage(data);
            return ok(message);
        } catch (error) {
            return fail("MESSAGE_SEND_ERROR", error?.message || "Failed to send message");
        }
    };
};
