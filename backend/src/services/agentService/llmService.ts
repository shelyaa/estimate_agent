import {createDeepAgent} from "deepagents";
import {tool} from "langchain";
import {ChatGoogleGenerativeAI} from "@langchain/google-genai"
import {TavilySearch} from "@langchain/tavily";
import {z} from "zod";
import type {IMessage} from "../../models/Message.js";
import dotenv from "dotenv"
dotenv.config()

const internetSearch = tool(
    async ({
               query,
               maxResults = 5,
               topic = "general",
               includeRawContent = false,
           }: {
        query: string;
        maxResults?: number;
        topic?: "general" | "news" | "finance";
        includeRawContent?: boolean;
    }) => {
        const apiKey = process.env.TAVILY_API_KEY;
        if (!apiKey) throw new Error("TAVILY_API_KEY not set");

        const tavilySearch = new TavilySearch({
            maxResults,
            tavilyApiKey: apiKey,
            includeRawContent,
            topic,
        });
        return await tavilySearch._call({query});
    },
    {
        name: "internet_search",
        description: "Run a web search",
        schema: z.object({
            query: z.string().describe("The search query"),
            maxResults: z
                .number()
                .optional()
                .default(5)
                .describe("Maximum number of results to return"),
            topic: z
                .enum(["general", "news", "finance"])
                .optional()
                .default("general")
                .describe("Search topic category"),
            includeRawContent: z
                .boolean()
                .optional()
                .default(false)
                .describe("Whether to include raw content"),
        }),
    }
);
// System prompt to steer the agent to be an expert researcher
const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

You have access to an internet search tool as your primary means of gathering information.

## \`internet_search\`

Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
`;

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
    tools: [internetSearch],
    systemPrompt: researchInstructions,
});

async function* fakeAgentStream() {
    yield {
        event: "on_chat_model_stream",
        data: { chunk: { content: "Hello " } },
    };

    await new Promise(r => setTimeout(r, 300));

    yield {
        event: "on_chat_model_stream",
        data: { chunk: { content: "this is " } },
    };

    await new Promise(r => setTimeout(r, 300));

    yield {
        event: "on_chat_model_stream",
        data: { chunk: { content: "a fake stream ✅" } },
    };

    yield { event: "on_chain_end" };
}

export function runAgent(_message: IMessage) {
    return fakeAgentStream();
}

// export function runAgent(message: IMessage) {
//     return agent.stream({
//         messages: [{role: "user", content: "What is langgraph?"}],
//     })
// }
