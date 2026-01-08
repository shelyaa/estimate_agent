import { ArrowUpIcon, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { RefObject, useState } from "react";

interface ChatInputProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): Promise<void>;
  isUploading: boolean;
  isLoading: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  handleSend(input: string): Promise<void>;
  uploadedFilePath: string | null
}

export const ChatInput = ({fileInputRef, handleFileSelect, isUploading, isLoading, inputRef, handleSend, uploadedFilePath}: ChatInputProps) => {
	
  const [input, setInput] = useState("");

  const canSend = (!!input.trim()) && !isLoading;
  
  return (
		<div className="flex gap-2">
			<input
				ref={fileInputRef}
				type="file"
				accept="application/pdf"
				className="hidden"
				onChange={handleFileSelect}
				disabled={isUploading || isLoading}
			/>
			<Button
				variant="outline"
				size="icon"
				onClick={() => fileInputRef.current?.click()}
				disabled={isUploading || isLoading}
			>
				<Plus />
			</Button>
			<Input
				ref={inputRef}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						handleSend(input);
            setInput('');
					}
				}}
				placeholder="Ask something..."
				disabled={isLoading}
			/>
			<Button
				variant="outline"
				size="icon"
				disabled={!canSend}
				onClick={() => {
          handleSend(input)
          setInput('');
        }}
      >
				<ArrowUpIcon />
			</Button>
		</div>
	);
};
