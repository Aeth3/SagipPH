import { chatRepository } from "../data/repositories/ChatRepositoryImpl";
import { makeGetChats } from "../domain/usecases/chat/GetChats";
import { makeGetChatById } from "../domain/usecases/chat/GetChatById";
import { makeCreateChat } from "../domain/usecases/chat/CreateChat";
import { makeUpdateChat } from "../domain/usecases/chat/UpdateChat";
import { makeDeleteChat } from "../domain/usecases/chat/DeleteChat";
import { makeGetMessages } from "../domain/usecases/chat/GetMessages";
import { makeSendMessage } from "../domain/usecases/chat/SendMessage";

export const getChats = makeGetChats({ chatRepository });
export const getChatById = makeGetChatById({ chatRepository });
export const createChat = makeCreateChat({ chatRepository });
export const updateChat = makeUpdateChat({ chatRepository });
export const deleteChat = makeDeleteChat({ chatRepository });
export const getMessages = makeGetMessages({ chatRepository });
export const sendMessage = makeSendMessage({ chatRepository });
