import {Chat} from "../models/Chat.js";
import {CheckPoints, CheckPointWrites} from "../models/agentModels.js";

export async function createNewChat() {
    return Chat.create({});
}

export async function getAllChats() {
    return Chat.find().sort({ createdAt: -1 });
}

export async function deleteChatByChatId(chatId: string) {
    await CheckPointWrites.deleteMany({ thread_id: chatId });
    await CheckPoints.deleteMany({ thread_id: chatId });
    return Chat.deleteOne({ _id: chatId });
}