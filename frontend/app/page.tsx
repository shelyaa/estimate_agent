"use client";

import {useEffect, useRef, useState} from "react";
import {getChats, createChat, deleteChat} from "@/api/chat";
import {
  getMessages,
  createUserMessage,
  processMessageWithAgent,
} from "@/api/messages";
import {FileDownload} from "@/components/FileDownload";
import {AgentMessageView} from "@/components/ParsedMessage";
import useLocalStorage from "@/hooks/useStateWithLocalStorage";
import {FilePreview} from "@/components/FilePreview";
import {AssidePanel} from "@/components/AsidePanel";
import {useFileUpload} from "@/api/useUploadFile";
import {ChatInput} from "@/components/ChatInput";
import {Loader} from "@/components/ui/loader";

type Message = {
  _id?: string;
  sender: "user" | "agent";
  content: string;
  attachedFiles?: string | null;
};

type Chat = {_id: string};

export default function Page() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>(
    "activeChatId",
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileIsVisible, setFileisVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const {
    uploadedFilePath,
    attachedFile,
    fileStatus,
    uploadProgress,
    uploadFile,
    handleRemoveFile,
  } = useFileUpload(fileInputRef);

  const activeChat = chats.find((c) => c._id === activeChatId);
  const canSend = !!input.trim() && !!activeChat && !isLoading;

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);

  useEffect(() => {
    async function loadChats() {
      const data = await getChats();
      setChats(data);
      if (!activeChatId && data.length > 0) {
        setActiveChatId(data[0]._id);
      }
    }

    loadChats();
  }, []);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      try {
        const data = await getMessages(activeChatId!);
        setMessages(data);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    }

    loadMessages();
  }, [activeChatId]);

  useEffect(() => {
    if (uploadedFilePath && attachedFile && fileStatus === "uploaded") {
      setFileisVisible(true);
    }
  }, [uploadedFilePath, attachedFile, fileStatus]);

  async function handleCreateChat() {
    try {
      const newChat = await createChat();
      setChats((prev) => [...prev, {...newChat, title: "New Chat"}]);
      setActiveChatId(newChat._id);
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  }

  async function handleDeleteChat(chatId: string) {
    try {
      await deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (chatId === activeChatId) setActiveChatId(null);
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileisVisible(true);
    setIsUploading(true);

    try {
      uploadFile(file);
    } catch (err) {
      console.error("Error uploading file:", err);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSend() {
    if (!activeChatId || (!input.trim() && !uploadedFilePath)) return;

    setIsLoading(true);

    try {
      const userMessage = await createUserMessage(
        activeChatId,
        input,
        uploadedFilePath ?? undefined
      );

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      const agentMessage = await processMessageWithAgent(userMessage._id!);
      setMessages((prev) => [...prev, agentMessage]);

      handleRemoveFile();
      setFileisVisible(false);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="h-screen flex overflow-hidden bg-gray-100">
      <AssidePanel
        handleCreateChat={handleCreateChat}
        setActiveChatId={setActiveChatId}
        handleDeleteChat={handleDeleteChat}
        chats={chats}
        activeChatId={activeChatId}
      />
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
                    <FileDownload
                      fileStatus={fileStatus}
                      filePath={msg.attachedFiles}
                    />
                  )}

                  {msg.sender === "agent" ? (
                    <AgentMessageView msg={JSON.parse(JSON.stringify(msg))} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && <Loader />}
            <div ref={bottomRef} />
          </div>
          {fileIsVisible ? (
            <FilePreview
              attachedFile={attachedFile}
              fileStatus={fileStatus}
              uploadProgress={uploadProgress}
              handleRemoveFile={handleRemoveFile}
            />
          ) : null}
          {activeChatId ? (
            <ChatInput
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              isUploading={isUploading}
              isLoading={isLoading}
              inputRef={inputRef}
              handleSend={handleSend}
              setInput={setInput}
              input={input}
              canSend={canSend}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
