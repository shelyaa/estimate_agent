import { ArrowUpIcon, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dispatch, RefObject, SetStateAction } from "react";

interface ChatInputProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): Promise<void>;
  isUploading: boolean;
  isLoading: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  handleSend(): Promise<void>;
  setInput: Dispatch<SetStateAction<string>>;
  input: string;
  canSend: boolean | "" | null | undefined;
}

export const ChatInput = ({fileInputRef, handleFileSelect, isUploading, isLoading, inputRef, handleSend, setInput, input, canSend}: ChatInputProps) => {
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
						handleSend();
					}
				}}
				placeholder="Ask something..."
				disabled={isLoading}
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
	);
};
