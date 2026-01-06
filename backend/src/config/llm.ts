import dotenv from "dotenv"
import { ChatOpenAI } from "@langchain/openai";
import {ChatGoogleGenerativeAI} from "@langchain/google-genai"
dotenv.config()

const googleApiKey = process.env.GOOGLE_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;

if(!googleApiKey) {
  console.warn("GOOGLE_API_KEY not set");
} else if (!openAiApiKey){
  console.warn("OPENAI_API_KEY not set");
}

if(!googleApiKey && !openAiApiKey){
  throw new Error("No API keys for LLMs are set");
}

export const llmModel = () => {
  if (googleApiKey) {
    const googleGenAI = new ChatGoogleGenerativeAI({
      apiKey: googleApiKey,
      temperature: 0,
      model: "gemini-2.5-flash",
    });
    return googleGenAI;
  }
  const openAI = new ChatOpenAI({
    apiKey: openAiApiKey,
    model: "gpt-4o",
    temperature: 0,
  })
  return openAI
}
