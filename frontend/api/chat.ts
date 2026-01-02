import axios from "axios";

const BASE_URL = "http://localhost:5000/api/chat";

export const getChats = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const createChat = async () => {
  const res = await axios.post(BASE_URL, );
  return res.data;
};

export const deleteChat = async (chatId: string) => {
  const res = await axios.delete(`${BASE_URL}/${chatId}`);
  return res.data;
};
