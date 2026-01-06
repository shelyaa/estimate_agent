import type {Request, Response} from "express";
import {
    createUserMessage,
    getAllMessages,
    getMessageById,
    processMessageWithAgent,
} from "../services/messagesService.js"
import type {IMessage} from "../models/Message.js";
import {Types} from "mongoose";

export async function sendMessage(req: Request, res: Response) {
    try {
        const userMessage = req?.body?.message as string;
        const chatId = req?.body?.chatId as Types.ObjectId;
        const filePath = req?.body?.filePath as string;

        if (!userMessage || !chatId) {
            return res.status(400).json({message: "Message and chatId are required"});
        }

        const message: IMessage = {
            sender: "user",
            content: userMessage,
            attachedFiles: filePath ?? null,
            chatId,
        };

        const createdMessage = await createUserMessage(message);
        res.json(createdMessage);
    } catch (err: any) {
        res.status(500).json({message: err.message});
    }
}

export async function processMessage(req: Request, res: Response) {
    try {
        const messageId = req?.params?.messageId as string;

        if (!messageId) {
            return res.status(400).json({message: "messageId is required"});
        }

        const userMessage = await getMessageById(messageId);
        if (!userMessage) {
            return res.status(404).json({message: "Message not found"});
        }

        const agentMessage = await processMessageWithAgent(userMessage);
        res.json(agentMessage);
    } catch (err: any) {
        res.status(500).json({message: err.message});
    }
}

export async function getMessages(req: Request, res: Response) {
    try {
        const chatId = req?.params?.chatId as string;
        if (!chatId) throw new Error("chatId is required");
        const messages = await getAllMessages(chatId);
        res.json(messages);
    } catch (err: any) {
        res.status(500).json({message: err.message});
    }
}

export async function downloadFileByFilePath(req: Request, res: Response) {
    try {
        const filePath = req?.query?.filePath as string;

        if (!filePath) throw new Error("FilePath is required");

        res.download(filePath);
    } catch (err: any) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
}

export async function uploadPdf(req: Request, res: Response) {
    try {
        const filePath = req?.file?.path;
        if (!filePath) throw new Error("FilePath is required");

        res.json({filePath});
    } catch (err: unknown) {
        const error = err as Error;
        res.status(500).json({message: 'File was not uploaded successfully'});
    }
}
