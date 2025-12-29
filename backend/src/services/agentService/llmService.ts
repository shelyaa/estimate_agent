import {createDeepAgent} from "deepagents";
import { MemorySaver } from "@langchain/langgraph";
import {z} from "zod";
import type {IMessage} from "../../models/Message.js";
import dotenv from "dotenv";
import { llmModel } from "../../config/llm.js";
import {getHistoricalEstimatesTool, pdfReaderTool} from "./tools.js";
import {testSystemPrompt} from "./prompts.js";
dotenv.config()

const checkpointer = new MemorySaver();

const agent = createDeepAgent({
    model: llmModel(),
    tools: [getHistoricalEstimatesTool, pdfReaderTool],
    systemPrompt: testSystemPrompt,
    checkpointer,
});

const config = { configurable: { thread_id: "1" } };

export async function runAgent(message: IMessage) {
    const result = await agent.invoke({
        messages: [
          // { role: "user", content: userPrompt },
          {role: message.sender, content: message.content},
          {role: message.sender, content: message.attachedFiles},
        ],
    }, config);

    return result.messages[result.messages.length - 1].content;
}

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



