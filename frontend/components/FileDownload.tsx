export const FileDownload = ({ filePath }: { filePath: string }) => {
	const fileName = filePath.split("/").pop();

	return (
		<a
			href={`http://localhost:5000/api/messages/download?filePath=${filePath}`}
			rel="noopener noreferrer"
			className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition"
		>
			<div className="text-2xl">📎</div>

			<div className="flex flex-col overflow-hidden">
				<span className="text-sm font-medium truncate">{fileName}</span>
				<span className="text-xs text-gray-500">Attached file</span>
			</div>
		</a>
	);
};
