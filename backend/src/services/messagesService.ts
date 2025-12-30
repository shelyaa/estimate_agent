import {type IMessage, Message} from "../models/Message.js";
import {runAgent} from "./agentService/llmService.js";

export async function sendMessageToAgent(message: IMessage) {
    await Message.create(message);

    const response = await runAgent(message);

    const agentMessage: IMessage = {
        chatId: message.chatId,
        sender: 'agent',
        content: response?.toString() || 'Sorry, I could not process your request.',
        attachedFiles: null
    }

    return Message.create(agentMessage);
}

export async function getAllMessages(chatId: string) {
    return Message.find({
        chatId
    }).sort({ createdAt: -1 });
}