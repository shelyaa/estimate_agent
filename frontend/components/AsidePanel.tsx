import { Button } from "./ui/button";
import { Dispatch, SetStateAction } from "react";

type Chat = { _id: string };

interface AsidePanelProps {
  handleCreateChat: () => Promise<void>;
  setActiveChatId: Dispatch<SetStateAction<string | null>>;
  handleDeleteChat: (chatId: string) => Promise<void>;
  activeChatId: string | null;
  chats: Chat[];
}

export const AssidePanel = ({handleCreateChat, setActiveChatId, handleDeleteChat, chats, activeChatId}: AsidePanelProps) => {
  return (
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
  )
}