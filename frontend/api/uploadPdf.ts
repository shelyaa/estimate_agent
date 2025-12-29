import axios from "axios";

export const uploadPdf = async (file: File) => {
  if (!file) throw new Error("File not attached");

  const formData = new FormData();
  formData.append("pdf", file);

  const res = await axios.post(
    "http://localhost:5000/api/upload-pdf",
    formData
  );
  return res.data;
};
