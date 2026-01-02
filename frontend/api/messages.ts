import axios from "axios";

const BASE_URL = "http://localhost:5000/api/messages";

export const getMessages = async (chatId: string) => {
  const res = await axios.get(`${BASE_URL}/${chatId}`);
  return res.data;
};

export const sendMessage = async (chatId: string, message: string, file?: File) => {
  const formData = new FormData();
  formData.append("message", message);
  formData.append("chatId", chatId);
  if (file) formData.append("file", file);

  const res = await axios.post(BASE_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
