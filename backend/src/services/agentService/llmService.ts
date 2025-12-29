import {createDeepAgent} from "deepagents";
import {ChatGoogleGenerativeAI} from "@langchain/google-genai";
import type {IMessage} from "../../models/Message.js";
import dotenv from "dotenv"
import {getHistoricalEstimatesTool} from "./tools.js";
import {testSystemPrompt, userPrompt} from "./prompts.js";
dotenv.config()

const googleApiKey = process.env.GOOGLE_API_KEY;

if(!googleApiKey) {
    throw new Error("GOOGLE_API_KEY not set");
}

const googleGenAI = new ChatGoogleGenerativeAI({
    apiKey: googleApiKey,
    temperature: 0,
    model: "gemini-2.5-flash",
});

const agent = createDeepAgent({
    model: googleGenAI,
    tools: [getHistoricalEstimatesTool],
    systemPrompt: testSystemPrompt
});

export async function runAgent(message: IMessage) {
    const result = await agent.invoke({
        messages: [{ role: "user", content: userPrompt }],
    });

    return result.messages[result.messages.length - 1].content;
}