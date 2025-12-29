import {createDeepAgent} from "deepagents";
import {z} from "zod";
import type {IMessage} from "../../models/Message.js";
import dotenv from "dotenv";
import { llmModel } from "../../config/llm.js";
import {getHistoricalEstimatesTool, pdfReaderTool} from "./tools.js";
import {testSystemPrompt} from "./prompts.js";
dotenv.config()


const agent = createDeepAgent({
    model: llmModel(),
    tools: [getHistoricalEstimatesTool, pdfReaderTool],
    systemPrompt: testSystemPrompt,

});

export async function runAgent(message: IMessage) {
    const result = await agent.invoke({
        messages: [
          // { role: "user", content: userPrompt },
          {role: message.sender, content: message.content},
          {role: message.sender, content: message.attachedFiles}
        ],
    });

    return result.messages[result.messages.length - 1].content;
}


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

// export function runAgent(message: IMessage) {
//     return agent.stream({
//         messages: [{role: "user", content: "What is langgraph?"}],
//     })
// }


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



