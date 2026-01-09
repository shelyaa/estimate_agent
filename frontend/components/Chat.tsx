import {useEffect, useRef} from "react";
import {FileDownload} from "./FileDownload";
import {AgentMessageView} from "./ParsedMessage";
import {Loader} from "@/components/ui/loader";

type Message = {
  _id?: string;
  sender: "user" | "agent";
  content: string;
  attachedFiles?: string | null;
};

interface ChatProps {
  activeChatId: string | null;
  messages: Message[];
  isLoading: boolean;
  fileStatus: string;
}

export const Chat = ({
  activeChatId,
  messages,
  isLoading,
  fileStatus,
}: ChatProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLoading) {
      bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 items-center justify-center">
      {!activeChatId && (
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-gray-400">Create or select a chat</div>
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
  );
};
