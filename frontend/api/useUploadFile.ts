import {RefObject, useState} from "react";
import axios from "axios";
import useLocalStorage from "@/hooks/useStateWithLocalStorage";

export const useFileUpload = (
  fileInputRef: RefObject<HTMLInputElement | null>,
  activeChatId: string | null
) => {
  const [fileStatus, setFileStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useLocalStorage<
    string | null
  >("uploadedFilePath", null);
  const [fileMetadata, setFileMetadata] = useLocalStorage<{
    name: string;
    size: number;
  } | null>("fileMetadata", null);
  const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/messages`;

  const uploadFile = async (file: File) => {
    if (!activeChatId) return;

    setAttachedFile(file);
    setFileStatus("uploading");
    setUploadProgress(0);

    setFileMetadata({
      name: file.name,
      size: file.size,
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${BASE_URL}/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        },
      });
      // save file by chatId
      const objectToSave = JSON.stringify({[activeChatId]: res.data.filePath});
      setUploadedFilePath(objectToSave);
      setFileStatus("uploaded");
    } catch (error) {
      setFileStatus("error");
      console.error(error);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setFileStatus("idle");
    setUploadProgress(0);
    setUploadedFilePath(null);
    setFileMetadata(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    attachedFile,
    fileStatus,
    uploadProgress,
    uploadFile,
    handleRemoveFile,
    uploadedFilePath,
    fileMetadata,
  };
};
