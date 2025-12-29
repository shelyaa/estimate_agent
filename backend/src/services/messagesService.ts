import {type IMessage, Message} from "../models/Message.js";
// import {runAgent} from "./agentService/llmService.js";

// export async function sendMessageToAgent(message: IMessage) {
//     return runAgent(message);
// }

export async function getAllMessages() {
    return Message.find().sort({ createdAt: -1 });
}