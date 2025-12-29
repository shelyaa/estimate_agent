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
    systemPrompt: testSystemPrompt,
});

// async function* fakeAgentStream() {
//     yield {
//         event: "on_chat_model_stream",
//         data: { chunk: { content: "Hello " } },
//     };
//
//     await new Promise(r => setTimeout(r, 300));
//
//     yield {
//         event: "on_chat_model_stream",
//         data: { chunk: { content: "this is " } },
//     };
//
//     await new Promise(r => setTimeout(r, 300));
//
//     yield {
//         event: "on_chat_model_stream",
//         data: { chunk: { content: "a fake stream ✅" } },
//     };
//
//     yield { event: "on_chain_end" };
// }

// export function runAgent(_message: IMessage) {
//     return fakeAgentStream();
// }

export function runAgent(message: IMessage) {
    return agent.stream({
        messages: [{role: "user", content: userPrompt}],
    })
}
