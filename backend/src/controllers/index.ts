import type {Request, Response} from "express";
import {getAllMessages, sendMessageToAgent} from "../services/messagesService.js"

export async function sendMessage(req: Request, res: Response) {
    try {
        const message = req?.body?.message;
        if (!message) throw new Error("Message is required");

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

