interface FilePreviewProps {
  attachedFile: File | null;
  fileStatus: string;
  uploadProgress: number;
  handleRemoveFile: ()=> void;
  activeChatId: string | null;
  uploadedFilePath: string | null;
}

export const FilePreview = ({ attachedFile, fileStatus, uploadProgress, handleRemoveFile, activeChatId, uploadedFilePath}: FilePreviewProps) => {

  if (!attachedFile || !uploadedFilePath) return null;

  const parsedFilePath = JSON.parse(uploadedFilePath);

  if (!activeChatId || !parsedFilePath[activeChatId]) return null;

  return (
    <div className="border rounded px-3 py-2 text-sm bg-white shadow-sm w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="truncate max-w-45">📄 {attachedFile.name}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
              fileStatus === "uploading"
                ? "bg-blue-100 text-blue-700 animate-pulse"
                : fileStatus === "error" 
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {fileStatus === "uploading" ? `Uploading... ${uploadProgress}%` : 
             fileStatus === "error" ? "Error" : "Uploaded"}
          </span>
        </div>
        <button
          onClick={handleRemoveFile}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          type="button"
        >
          ✕
        </button>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${
            fileStatus === "error" ? "bg-red-500" : 
            uploadProgress === 100 ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    </div>
  );
};