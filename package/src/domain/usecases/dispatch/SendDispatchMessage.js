import { ok, fail } from "../../shared/result";

export const makeSendDispatchMessage = ({ dispatchRepository }) => {
  return async (payload) => {
    try {
      const message = await dispatchRepository.dispatchMessage(payload);
      return ok(message);
    } catch (error) {
      return fail(
        "DISPATCH_MESSAGE_SEND_ERROR",
        error?.message || "Failed to send dispatch message"
      );
    }
  };
};
