export class DispatchMessageRepository {
    // -------------------------
    // SEND
    // -------------------------

    /**
     * @param {Object} _payload
     * @returns {Promise<DispatchMessage>} created DispatchMessage
     */
    async dispatchMessage(_payload) {
        throw new Error("DispatchMessageRepository.dispatchMessage() not implemented");
    }

    // -------------------------
    // READ
    // -------------------------

    /**
     * @param {string} _chatId
     * @returns {Promise<DispatchMessage[]>}
     */
    async getMessages(_chatId) {
        throw new Error("DispatchMessageRepository.getMessages() not implemented");
    }

    /**
     * @param {string} _chatId
     * @param {number} _limit
     * @returns {Promise<DispatchMessage[]>}
     */
    async getLatest(_chatId, _limit) {
        throw new Error("DispatchMessageRepository.getLatest() not implemented");
    }

    // -------------------------
    // REALTIME
    // -------------------------

    /**
     * @param {string} _chatId
     * @param {(msg:DispatchMessage)=>void} _callback
     * @returns {() => void} unsubscribe
     */
    subscribe(_chatId, _callback) {
        throw new Error("DispatchMessageRepository.subscribe() not implemented");
    }

    // -------------------------
    // STATE
    // -------------------------

    /**
     * @param {string} _messageId
     * @returns {Promise<void>}
     */
    async markAsDelivered(_messageId) {
        throw new Error("DispatchMessageRepository.markAsDelivered() not implemented");
    }

    /**
     * @param {string} _messageId
     * @returns {Promise<void>}
     */
    async markAsRead(_messageId) {
        throw new Error("DispatchMessageRepository.markAsRead() not implemented");
    }
}
