import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/chat`

console.log(process.env.BASE_URL);

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

export const updateChat = async (chatId: string, title: string) => {
  const res = await axios.put(`${BASE_URL}/${chatId}`, {title: title});
  return res.data;
}
