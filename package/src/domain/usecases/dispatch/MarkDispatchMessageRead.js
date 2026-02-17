import { ok, fail } from "../../shared/result";

export const makeMarkDispatchMessageRead = ({ dispatchRepository }) => {
    return async (messageId) => {
        try {
            await dispatchRepository.markAsRead(messageId);
            return ok(true);
        } catch (error) {
            return fail(
                "DISPATCH_MESSAGE_MARK_READ_ERROR",
                error?.message || "Failed to mark dispatch message as read"
            );
        }
    };
};
