import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/messages`;

type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export const getMessages = async (chatId: string) => {
  const res = await axios.get(`${BASE_URL}/${chatId}`);
  return res.data;
};

export const sendMessage = async (
  chatId: string,
  message: string,
  file?: File
) => {
  const formData = new FormData();
  formData.append("message", message);
  formData.append("chatId", chatId);
  if (file) formData.append("file", file);

  try {
    const res = await axios.post(BASE_URL, formData, {
      headers: {"Content-Type": "multipart/form-data"},
    });

    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const apiError = err.response?.data as ApiErrorResponse | undefined;

      throw new Error(
        apiError?.error?.message ??
          "Failed to get response from AI. Please try again."
      );
    }

    throw err;
  }
};
