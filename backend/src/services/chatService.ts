import { Chat } from "../models/Chat.js";
import { CheckPoints, CheckPointWrites } from "../models/agentModels.js";
import { Message } from "../models/Message.js";

export async function createNewChat() {
	return Chat.create({});
}

export async function getAllChats() {
	return Chat.find().sort({ createdAt: -1 });
}

export async function deleteChatByChatId(chatId: string) {
	await Message.deleteMany({ chatId });
	await CheckPointWrites.deleteMany({ thread_id: chatId });
	await CheckPoints.deleteMany({ thread_id: chatId });
	return Chat.deleteOne({ _id: chatId });
}

export async function updateChatById(chatId: string, title: string) {
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId, 
    { title: title }, 
    { new: true, runValidators: true }
  );

  if (!updatedChat) {
    throw new Error("Chat not found");
  }

  return updatedChat;
}
