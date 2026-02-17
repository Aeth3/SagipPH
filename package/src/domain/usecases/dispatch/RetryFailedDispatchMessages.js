export const makeRetryFailedDispatchMessages = ({ offlineDispatchQueue }) => {
  return async ({ messageId } = {}) => {
    // Retry specific message
    if (messageId) {
      await offlineDispatchQueue.retryByMessageId(messageId);
      return;
    }

    // Retry all failed
    await offlineDispatchQueue.retryFailed();
  };
};