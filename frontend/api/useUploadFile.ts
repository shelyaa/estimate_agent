// hooks/useFileUpload.js
import { RefObject, useState } from "react";
import axios from "axios";

export const useFileUpload = (fileInputRef: RefObject<HTMLInputElement | null>) => {
	const [fileStatus, setFileStatus] = useState("idle"); // idle, uploading, uploaded, error
	const [uploadProgress, setUploadProgress] = useState(0);
	const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>()
  const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/messages`;

	const uploadFile = async (file: File) => {
		setAttachedFile(file);
		setFileStatus("uploading");
		setUploadProgress(0);

		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await axios.post(`${BASE_URL}/upload`, formData, {
				onUploadProgress: (progressEvent) => {
					if (progressEvent.total) {
						const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						setUploadProgress(percent);
					} 
				},
			});

      setUploadedFilePath(res.data.filePath)

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
    if (fileInputRef.current) fileInputRef.current.value = "";
	};

	return {
		attachedFile,
		fileStatus,
		uploadProgress,
		uploadFile,
		handleRemoveFile,
    uploadedFilePath,
    // setAttachedFile,
    // setFileStatus,
    // setUploadProgress,
    // setUploadedFilePath
	};
};
