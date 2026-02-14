export class ChatRepository {
    async getChats() { throw new Error("ChatRepository.getChats() not implemented"); }
    async getChatById(id) { throw new Error("ChatRepository.getChatById() not implemented"); }
    async createChat(chatData) { throw new Error("ChatRepository.createChat() not implemented"); }
    async updateChat(id, changes) { throw new Error("ChatRepository.updateChat() not implemented"); }
    async deleteChat(id) { throw new Error("ChatRepository.deleteChat() not implemented"); }
    async clearChats() { throw new Error("ChatRepository.clearChats() not implemented"); }
    async getMessages(chatId) { throw new Error("ChatRepository.getMessages() not implemented"); }
    async sendMessage(messageData) { throw new Error("ChatRepository.sendMessage() not implemented"); }
    async deleteMessages(chatId) { throw new Error("ChatRepository.deleteMessages() not implemented"); }
}
