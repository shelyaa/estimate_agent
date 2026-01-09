"use client";

import {useEffect, useRef, useState} from "react";
import {
  getMessages,
  createUserMessage,
  processMessageWithAgent,
} from "@/api/messages";
import useLocalStorage from "@/hooks/useStateWithLocalStorage";
import {FilePreview} from "@/components/FilePreview";
import {AssidePanel} from "@/components/AsidePanel";
import {useFileUpload} from "@/api/useUploadFile";
import {ChatInput} from "@/components/ChatInput";
import {Chat} from "@/components/Chat";
import {toast} from "react-toastify";

type Message = {
  _id?: string;
  sender: "user" | "agent";
  content: string;
  attachedFiles?: string | null;
};

export default function Page() {
  const [activeChatId, setActiveChatId] = useLocalStorage<string | null>(
    "activeChatId",
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileIsVisible, setFileisVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadedFilePath,
    attachedFile,
    fileStatus,
    uploadProgress,
    uploadFile,
    handleRemoveFile,
  } = useFileUpload(fileInputRef, activeChatId);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

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

  async function handleSend(input: string) {
    if (!activeChatId || (!input.trim() && !uploadedFilePath)) return;

    setIsLoading(true);
    

    try {
      const userMessage = await createUserMessage(
        activeChatId,
        input,
        uploadedFilePath ? JSON.parse(uploadedFilePath)[activeChatId] : undefined
      );

      setMessages((prev) => [...prev, userMessage]);
      setFileisVisible(false);

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      const agentMessage = await processMessageWithAgent(userMessage._id!);
      if (agentMessage.status === "error") {
        toast.error(`Error processing message: ${agentMessage.data}`);
        return;
      }

      setMessages((prev) => [...prev, agentMessage.data]);

      handleRemoveFile();
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="h-screen flex overflow-hidden bg-gray-100">
      <AssidePanel
        setActiveChatId={setActiveChatId}
        activeChatId={activeChatId}
      />
      <section className="flex-1 p-6 flex justify-center">
        <div className="w-full max-w-5xl bg-white rounded-xl shadow p-4 flex flex-col gap-4">
          <h1 className="text-xl font-semibold">Project Estimate Agent</h1>

          <Chat
            activeChatId={activeChatId}
            messages={messages}
            isLoading={isLoading}
            fileStatus={fileStatus}
          />

          {fileIsVisible ? (
            <FilePreview
              attachedFile={attachedFile}
              fileStatus={fileStatus}
              uploadProgress={uploadProgress}
              handleRemoveFile={handleRemoveFile}
              activeChatId={activeChatId}
              uploadedFilePath={uploadedFilePath}
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
              uploadedFilePath={uploadedFilePath}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
