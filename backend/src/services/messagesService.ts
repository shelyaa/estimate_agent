import {type IMessage, Message} from "../models/Message.js";
import {runAgent} from "./agentService/llmService.js";

export async function createUserMessage(message: IMessage) {
  const newMessage = await Message.create(message);
  return newMessage;
}

export async function processMessageWithAgent(userMessage: IMessage) {
  const response = await runAgent(userMessage);

  const agentMessage: IMessage = {
    chatId: userMessage.chatId,
    sender: "agent",
    content: response?.toString() || JSON.stringify({status: 'other', details: "No tasks to estimate."}),
    attachedFiles: null,
  };

  return Message.create(agentMessage);
}
export async function getAllMessages(chatId: string) {
  return Message.find({
    chatId,
  }).sort({createdAt: 1});
}

export const getMessageById = async (messageId: string) => {
  return Message.findById(messageId);
}
