import type {Request, Response} from "express";
import {getAllMessages, sendMessageToAgent} from "../services/messagesService.js"

export async function sendMessage(req: Request, res: Response) {
    try {
        const message = req?.body?.message;
        if (!message) throw new Error("Message is required");
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const stream = await sendMessageToAgent(message);

        for await (const chunk of stream) {
            console.log(chunk)
            if (chunk.event === "on_chat_model_stream") {
                const token = chunk.data?.chunk?.content;

                if (token) {
                    res.write(`data: ${token}\n\n`);
                }
            }

            if (chunk.event === "on_chain_end") {
                res.write(`event: end\ndata: done\n\n`);
            }
        }

        res.end();
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

