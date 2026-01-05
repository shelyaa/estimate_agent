// import {Socket} from "socket.io";
// import {Events} from "../constants/events.js";
// import type {NewMessageFromClient} from "../constants/ioHandlerTypes.js";
// import type {IMessage} from "../models/Message.js";
// import {sendMessageToAgent} from "../services/messagesService.js";
//
// export function ioHandler(socket: Socket) {
//     console.log(`New client connected: ${socket.id}`);
//
//     socket.on(Events.NEW_MESSAGE_FROM_CLIENT, (data: NewMessageFromClient) => {
//         const {message, chatId, file} = data;
//         if (!message || !chatId) throw new Error("Message is required");
//
//         const buffer = Buffer.from(message, 'utf-8');
//
//         const newUserMessage: IMessage = {sender: 'user', content: message, attachedFiles: file ?? null, chatId}
//         const result = await sendMessageToAgent(message);
//
//         socket.emit(result);
//     })
// }