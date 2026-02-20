import NetInfo from "@react-native-community/netinfo";
import { DispatchMessageRepository } from "../../domain/repositories/DispatchMessageRepository.js";
import { DispatchMessage } from "../../domain/entities/DispatchMessage.js";
import { OfflineDispatchQueue } from "../../offline/OfflineDispatchQueue.js";
import { asyncStorageAdapter } from "../../infra/storage/asyncStorageAdapter.js";
import { addMessage, updateMessageStatus } from "../../infra/storage/DispatchMessageStore.js";

export class DispatchMessageRepositoryImpl extends DispatchMessageRepository {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
    this.offlineQueue = new OfflineDispatchQueue(this, asyncStorageAdapter);
  }

  async dispatchMessage(payload) {
    const optimistic = new DispatchMessage({
      ...payload,
      timestamp: Date.now(),
      status: "pending",
    });

    addMessage(optimistic);

    const net = await NetInfo.fetch();
    const isOnline = net?.isConnected && net?.isInternetReachable !== false;

    if (!isOnline) {
      await this.offlineQueue.enqueue(payload);
      return optimistic;
    }

    try {
      const response = await this.apiClient.post(
        "/api/v1/process/dispatchQueue/add",
        payload
      );

      const sentMessage = DispatchMessage.fromJSON(response.data);

      updateMessageStatus(optimistic.id, {
        status: "sent",
        ...sentMessage,
      });

      return sentMessage;
    } catch (error) {
      const isNetworkError = !error.response;

      if (isNetworkError) {
        await this.offlineQueue.enqueue(payload);
      }

      updateMessageStatus(optimistic.id, { status: "failed" });

      this.#handleError(error);
    }
  }

  async getMessages(chatId) {
    try {
      const response = await this.apiClient.get(
        `/api/v1/process/dispatchQueue/${chatId}/messages`
      );
      return response.data.map(DispatchMessage.fromJSON);
    } catch (error) {
      this.#handleError(error);
    }
  }

  async getLatest(chatId, limit = 20) {
    try {
      const response = await this.apiClient.get(
        `/api/v1/process/dispatchQueue/${chatId}/messages?limit=${limit}`
      );
      return response.data.map(DispatchMessage.fromJSON);
    } catch (error) {
      this.#handleError(error);
    }
  }

  async markAsRead(messageId) {
    try {
      await this.apiClient.post(`/api/v1/process/dispatchQueue/${messageId}/read`);
    } catch (error) {
      this.#handleError(error);
    }
  }

  #handleError(error) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    if (error.message) throw new Error(error.message);
    throw new Error("Unknown dispatch message error");
  }
}
