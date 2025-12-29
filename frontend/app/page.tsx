"use client";

import {useRef, useState} from "react";
import ReactMarkdown from "react-markdown";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ArrowUpIcon, Plus} from "lucide-react";
import {uploadPdf} from "@/api/uploadPdf";

type Message = {
  role: "user" | "agent";
  content: string;
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfStatus, setPdfStatus] = useState<
    "idle" | "uploading" | "parsed" | "error"
  >("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "pupupu",
        },
      ]);
    }, 600);
  }
  const canSend = input.trim().length > 0;

  async function handlePdfUpload(file: File) {
    try {
      setPdfFile(file);
      setPdfStatus("uploading");

      const result = await uploadPdf(file);

      console.log("PDF result:", result);

      setPdfStatus("parsed");
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setPdfFile(null);
      setPdfStatus("idle");
    }
  }

  function removePdf() {
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow p-4 flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Project Estimate Agent</h1>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-60">
          {messages.length === 0 && (
            <div className="text-gray-400 text-md text-center flex items-center justify-center min-h-50">
              Start a conversation or upload a PDF
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`px-4 py-2 rounded-xl max-w-[80%] ${
                msg.role === "user" ? "bg-gray-200 ml-auto" : "bg-gray-100"
              }`}
            >
              {msg.role === "agent" ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          ))}
        </div>
        {pdfFile && (
          <div className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <span>📄</span>
              <span className="font-medium truncate max-w-50">
                {pdfFile.name}
              </span>

              {pdfStatus === "uploading" && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                  Processing...
                </span>
              )}

              {pdfStatus === "parsed" && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  Ready
                </span>
              )}
            </div>

            <button
              onClick={removePdf}
              className="text-gray-400 hover:text-gray-700 transition"
              aria-label="Remove PDF"
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
              const file = e.target.files?.[0];
              if (file) handlePdfUpload(file);
            }}
          />

          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus />
          </Button>

          <Input
            type="text"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSend) sendMessage();
            }}
          />

          <Button
            variant="outline"
            size="icon"
            aria-label="Submit"
            onClick={sendMessage}
            disabled={!canSend}
          >
            <ArrowUpIcon />
          </Button>
        </div>
      </div>
    </main>
  );
}
