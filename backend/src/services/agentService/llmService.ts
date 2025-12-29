import {createDeepAgent} from "deepagents";
import {tool} from "langchain";
import {z} from "zod";
import type {IMessage} from "../../models/Message.js";
import dotenv from "dotenv";
import { llmModel } from "../../config/llm.js";
import type { AgentState } from "./llmSchema.js";
dotenv.config()


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

const deepAgentPrompt = `
  You are an expert estimator. 
    1. Based on the requirements, create a high-level task breakdown.
    2. For each task, find the most similar task in the provided Historical Data and use its hours.
    3. Format the output as a summary table with roles, totals, and risks.
  You have 
`;

export const agent = createDeepAgent({
  model: llmModel(),
  // tools: [internetSearch],
  systemPrompt: deepAgentPrompt,
  subagents: [critiqueSubAgent, researchSubAgent],
});

const RequirementsAnalysisSchema = z.object({
  requirements: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      clarity: z.enum(["clear", "unclear"]),
      missingInfo: z.array(z.string()),
    })
  ),
  clarificationQuestions: z.array(z.string()),
});



