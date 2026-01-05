"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, Plus } from "lucide-react";
import { getChats, createChat, deleteChat } from "@/api/chat";
import { getMessages, sendMessage } from "@/api/messages";
import { FileDownload } from "@/components/FileDownload";
import { AgentMessageView } from "@/components/ParsedMessage";

type Message = {
	_id?: string;
	sender: "user" | "agent";
	content: string;
	attachedFiles?: string | null;
};

type Chat = { _id: string; title: string };

export default function Page() {
	const [chats, setChats] = useState<Chat[]>([]);
	const [activeChatId, setActiveChatId] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [attachedFile, setAttachedFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [fileStatus, setFileStatus] = useState<"idle" | "uploaded" | "parsed">(
		"idle"
	);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);

	const activeChat = chats.find((c) => c._id === activeChatId);
	const canSend = (!!input.trim() || attachedFile) && !!activeChat;

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		async function loadChats() {
			const data = await getChats();
			setChats(data);
			if (data.length > 0) setActiveChatId(data[0]._id);
		}
		loadChats();
	}, []);

	useEffect(() => {
		if (!activeChatId) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setMessages([]);
			return;
		}

		async function loadMessages() {
			try {
				if (!activeChatId) return;
				const data = await getMessages(activeChatId);
				setMessages(data);
			} catch (err) {
				console.error(err);
			}
		}
		loadMessages();
	}, [activeChatId]);

	async function handleCreateChat() {
		try {
			const newChat = await createChat();
			setChats((prev) => [...prev, { ...newChat, title: "New Chat" }]);
			setActiveChatId(newChat._id);
		} catch (err) {
			console.error(err);
		}
	}

	async function handleDeleteChat(chatId: string) {
		try {
			await deleteChat(chatId);
			setChats((prev) => prev.filter((c) => c._id !== chatId));
			if (chatId === activeChatId) setActiveChatId(null);
		} catch (err) {
			console.error(err);
		}
	}

	async function handleSend() {
		if (!activeChatId || (!input.trim() && !attachedFile)) return;

		const optimisticMessage: Message = {
			sender: "user",
			content: input,
			attachedFiles: attachedFile?.name ?? null,
		};

		setMessages((prev) => [...prev, optimisticMessage]);
		setAttachedFile(null);
		setInput("");

		try {
			setIsLoading(true);
			const result = await sendMessage(
				activeChatId,
				input,
				attachedFile ?? undefined
			);
			setFileStatus("parsed");
			setMessages((prev) => [...prev, result]);
		} catch (err) {
			setIsLoading(false);
			console.error(err);
		}
		setIsLoading(false);
	}

	return (
		<main className="h-screen flex overflow-hidden bg-gray-100">
			<aside className="w-64 bg-white border-r p-4 space-y-3">
				<Button className="w-full" onClick={handleCreateChat}>
					+ New chat
				</Button>

				{chats.map((chat) => (
					<div
						key={chat._id}
						onClick={() => setActiveChatId(chat._id)}
						className={`flex justify-between items-center px-3 py-2 rounded cursor-pointer ${
							chat._id === activeChatId ? "bg-gray-200" : "hover:bg-gray-100"
						}`}
					>
						<span className="truncate">{chat._id}</span>
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleDeleteChat(chat._id);
							}}
							className="text-gray-400 hover:text-red-500"
						>
							✕
						</button>
					</div>
				))}
			</aside>

			<section className="flex-1 p-6 flex justify-center">
				<div className="w-full max-w-5xl bg-white rounded-xl shadow p-4 flex flex-col gap-4">
					<h1 className="text-xl font-semibold">Project Estimate Agent</h1>

					<div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-20vh items-center justify-center">
						{!activeChatId && (
							<div className="text-gray-400 text-center">
								Create or select a chat
							</div>
						)}

						{messages.map((msg, idx) => (
							<div
								key={msg._id ?? idx}
								className={`px-4 py-2 rounded-xl max-w-[80%] whitespace-pre-wrap ${
									msg.sender === "user" ? "bg-gray-200 ml-auto" : "bg-gray-100"
								}`}
							>
								<div className="flex flex-col gap-2">
									{msg.attachedFiles && (
										<FileDownload filePath={msg.attachedFiles} />
									)}

									{msg.sender === "agent" ? (
										<AgentMessageView msg={JSON.parse(JSON.stringify(msg))} />
									) : (
										msg.content
									)}
								</div>
							</div>
						))}
						{isLoading && "Loading..."}
						<div ref={bottomRef} />
					</div>

					{attachedFile && (
						<div className="flex justify-between items-center border rounded px-3 py-2 text-sm">
							<div>
								<span className="truncate">📄 {attachedFile.name}</span>
								<span
									className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
										fileStatus === "uploaded"
											? "bg-gray-100"
											: "bg-green-100 text-green-700"
									}`}
								>
									{fileStatus === "uploaded" ? "Uploaded" : "Parsed"}
								</span>
							</div>
							<button
								onClick={() => {
									setAttachedFile(null);
									if (fileInputRef.current) fileInputRef.current.value = "";
									setFileStatus("idle");
								}}
							>
								✕
							</button>
						</div>
					)}

					<div className="flex gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept="application/pdf"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0] ?? null;
								setAttachedFile(file);
								setFileStatus("uploaded");
							}}
						/>
						<Button
							variant="outline"
							size="icon"
							onClick={() => fileInputRef.current?.click()}
						>
							<Plus />
						</Button>
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSend();
								}
							}}
							placeholder="Ask something..."
						/>
						<Button
							variant="outline"
							size="icon"
							disabled={!canSend}
							onClick={handleSend}
						>
							<ArrowUpIcon />
						</Button>
					</div>
				</div>
			</section>
		</main>
	);
}
