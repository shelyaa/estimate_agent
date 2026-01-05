import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/messages`

export const getMessages = async (chatId: string) => {
    const res = await axios.get(`${BASE_URL}/${chatId}`);
    return res.data;
};

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {"Content-Type": "multipart/form-data"},
    });

    return res.data.filePath;
};

export const createUserMessage = async (
    chatId: string,
    message: string,
    filePath?: string
) => {
    const res = await axios.post(BASE_URL, {
        message,
        chatId,
        ...(filePath && {filePath}),
    });
    return res.data;
};

export const processMessageWithAgent = async (messageId: string) => {
    const res = await axios.post(`${BASE_URL}/${messageId}/process`);
    return res.data;
};
