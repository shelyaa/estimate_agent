import type {Request, Response} from "express";
import {getAllMessages, sendMessageToAgent} from "../services/messagesService.js"
import type { IMessage } from "../models/Message.js";

export async function sendMessage(req: Request, res: Response) {
    try {
        const userMessage = req?.body?.message;
        const file = req?.file?.path

        if (!userMessage) throw new Error("Message is required");
        const message: IMessage = {sender: 'user', content: userMessage, attachedFiles: file ? file : ''}
        const result = await sendMessageToAgent(message);

        res.json(result);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

export async function getMessages(req: Request, res: Response) {
    try {
        const messages = await getAllMessages();
        res.json(messages);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}


