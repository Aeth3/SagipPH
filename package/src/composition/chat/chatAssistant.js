import {
  sendMessage as sendGeminiMessage,
  resetChat as resetGeminiChat,
  generateChatTitleFromContext as generateGeminiChatTitleFromContext,
  extractDispatchState as extractDispatchStateFromGemini,
} from "../../services/geminiService";

export const sendChatPrompt = (text) => sendGeminiMessage(text);

export const resetChatConversation = () => resetGeminiChat();

export const generateChatTitleFromContext = (messages) =>
  generateGeminiChatTitleFromContext(messages);

export const extractDispatchState = (messages) =>
  extractDispatchStateFromGemini(messages);
