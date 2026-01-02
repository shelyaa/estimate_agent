import {createDeepAgent} from "deepagents";
import type {IMessage} from "../../models/Message.js";
import dotenv from "dotenv";
import { llmModel } from "../../config/llm.js";
import {getHistoricalEstimatesTool, pdfReaderTool} from "./tools.js";
import {systemPrompt} from "./prompts.js";
import {MongoDBSaver} from "@langchain/langgraph-checkpoint-mongodb";
import {getMongoClient} from "../../config/db.js";
dotenv.config()

let agent: any | null = null;

const agentSetup = async () => {
    if(agent) return agent;

    const client = await getMongoClient();
    // @ts-ignore
    const checkpointer = new MongoDBSaver({ client });

    agent = createDeepAgent({
        model: llmModel(),
        tools: [getHistoricalEstimatesTool, pdfReaderTool],
        systemPrompt: systemPrompt,
        checkpointer,
    });

    return agent;
}

export async function runAgent(message: IMessage) {

    const agent = await agentSetup();

    const config = { configurable: { thread_id: message.chatId } };

    const result = await agent.invoke({
        messages: [
          {role: message.sender, content: message.content},
          {role: message.sender, content: message.attachedFiles ?? ''},
        ],
    }, config);
    return result.messages[result.messages.length - 1]?.content;
}
