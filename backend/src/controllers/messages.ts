import type { Request, Response } from "express";
import {
	getAllMessages,
	getMessageById,
	sendMessageToAgent,
} from "../services/messagesService.js";
import type { IMessage } from "../models/Message.js";
import { Types } from "mongoose";

export async function sendMessage(req: Request, res: Response) {
	try {
		const userMessage = req?.body?.message as string;

		const chatId = req?.body?.chatId as Types.ObjectId;
		const file = req?.file?.path;

		if (!userMessage || !chatId) throw new Error("Message is required");

		const message: IMessage = {
			sender: "user",
			content: userMessage,
			attachedFiles: file ?? null,
			chatId,
		};
		const result = await sendMessageToAgent(message);

		res.json(result);
	} catch (err: any) {
		res.status(500).json({ message: err.message });
	}
}

export async function getMessages(req: Request, res: Response) {
	try {
		const chatId = req?.params?.chatId as string;
		if (!chatId) throw new Error("chatId is required");
		const messages = await getAllMessages(chatId);
		res.json(messages);
	} catch (err: any) {
		res.status(500).json({ message: err.message });
	}
}

export async function downloadFileByMessageId(req: Request, res: Response) {
	try {
		const filePath = req?.query?.filePath as string;

		if (!filePath) throw new Error("FilePath is required");

		res.download(filePath);
	} catch (err: any) {
		console.log(err);
		res.status(500).json({ message: err.message });
	}
}
