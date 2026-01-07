export const FileDownload = ({ filePath, fileStatus }: { filePath: string, fileStatus?: string }) => {
	const fileName = filePath.split("/").pop();

	return (
		<a
			href={`${process.env.NEXT_PUBLIC_API_URL}/api/messages/download?filePath=${filePath}`}
			rel="noopener noreferrer"
			className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition"
		>
			<div className="text-2xl">📎</div>

			<div className="flex flex-col overflow-hidden">
				<span className="text-sm font-medium truncate">{fileName}</span>
				<span className="text-xs text-gray-500">Attached file</span>
				<span
					className={`rounded-full px-2 py-0.5 text-xs w-fit ${
						fileStatus === "uploading"
							? "bg-blue-100 text-blue-700"
							: "bg-green-100 text-green-700"
					}`}
				>
					{fileStatus === "uploading" ? "Uploading..." : "Uploaded"}
				</span>
			</div>
		</a>
	);
};
