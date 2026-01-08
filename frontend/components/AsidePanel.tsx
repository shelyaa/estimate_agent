import { createChat, deleteChat, getChats } from "@/api/chat";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type Chat = { _id: string, title: string };

interface AsidePanelProps {
  setActiveChatId: Dispatch<SetStateAction<string | null>>;
  activeChatId: string | null;
  activeChatTitle: string
}

export const AssidePanel = ({ setActiveChatId, activeChatId, activeChatTitle}: AsidePanelProps) => {
  
  const [chats, setChats] = useState<Chat[]>([]);
  
  useEffect(() => {
		async function loadChats() {
			const data = await getChats();
      console.log(data[0]);
      
			setChats(data);
			if (!activeChatId && data.length > 0) {
				setActiveChatId(data[0]._id);
			}
		}

		loadChats();
	}, [activeChatTitle]);

  async function handleCreateChat() {
    try {
      const newChat = await createChat();
      setChats((prev) => [...prev, { ...newChat, title: "New Chat" }]);
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

  console.log(chats);
  
  
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
          <span className="truncate">{chat.title}</span>
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