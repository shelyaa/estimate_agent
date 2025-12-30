import type {Request, Response} from "express";
import {createNewChat, getAllChats, deleteChatByChatId} from "../services/chatService.js";

export async function createChat(req: Request, res: Response) {
    try {
        const result = await createNewChat();
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

export async function getChats(req: Request, res: Response) {
    try {
        const result = await getAllChats();
        res.json(result);
    }catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

export async function deleteChat(req: Request, res: Response) {
    try {
        const chatId = req.params?.chatId as string;
        if (!chatId) throw new Error("chatId is required");

        const result = await deleteChatByChatId(chatId);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}


