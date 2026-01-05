import {getVectorStore} from "../../config/vectorStore.js";
import { interrupt } from "@langchain/langgraph";
import {processPdf} from "../pdfService.js";
import type {GraphState} from "./state.js";
import {llmModel} from "../../config/llm.js";
import {brokenDownTasksZodSchema, clarifiedTextZodSchema} from "./schemas.js";
import {HumanMessage} from "@langchain/core/messages";
import {breakdownTasksPrompt, checkPDFPrompt} from "./prompts.js";

export async function getSimilarHistoricalEstimatesNode(state: GraphState) {
    console.log("--- START: getSimilarHistoricalEstimatesNode ---");
    const { vectorStore } = getVectorStore();

    const tasksBreakdown = state?.tasksBreakdown;

    if(!tasksBreakdown) {
        console.log("No tasks found to search history for.");
        return state;
    }

    for (const task of tasksBreakdown) {
        console.log(`Searching history for task: ${task.task}`);
        let output = "";

        const result = await vectorStore.similaritySearchWithScore(task.task, 5);

        for (const [doc, score] of result) {
            if(score > 0.6) {
                output += `- ${doc.pageContent}\n`;
            }
        }

        task.similarHistoricalTasks = output;
    }

    console.log("--- END: getSimilarHistoricalEstimatesNode ---");
    return state;
}

export async function getDataFromPdfNode(state: GraphState) {
    console.log("--- START: getDataFromPdfNode ---");
    try {
        const data = await processPdf(state.pdfUrl);

        if(!data) {
            throw new Error('Could not read pdf')
        }

        console.log("PDF data successfully extracted.");
        return {...state, dataToBreakdownTasks: data};
    } catch (error) {
        throw error;
    }
}

export async function checkRequirementsNode(state: GraphState) {
    console.log("--- START: checkRequirementsNode ---");
    if(!state.dataToBreakdownTasks) {
        throw new Error('No data to breakdown tasks from');
    }

    if (state.hasBeenClarified) {
        console.log("Requirements already clarified, skipping check.");
        return {
            ...state,
            clarificationText: null,
        };
    }

    const model = llmModel().withStructuredOutput(clarifiedTextZodSchema);

    try {
        const response = await model.invoke([
            new HumanMessage(checkPDFPrompt(state.dataToBreakdownTasks))
        ]);

        console.log(`LLM analysis finished. Questions found: ${response.clarification_questions.length > 0}`);
        return response.clarification_questions.length > 0 ? {
            ...state,
            clarificationText: JSON.stringify(response),
        } : {
            ...state,
            clarificationText: null,
        }
    }catch(error) {
        throw error;
    }
}

export async function clarifyUserRequirementsNode(state: GraphState) {
    console.log("--- NODE TRIGGERED: clarifyUserRequirementsNode ---");
    console.log("Waiting for user input via interrupt...");

    const userClarifications = interrupt({
        status: 'clarification_required',
        clarificationText: state.clarificationText
    });

    console.log("--- RESUMED: clarifyUserRequirementsNode ---");
    console.log("Received data from user:", JSON.stringify(userClarifications, null, 2));

    return {
        ...state,
        dataToBreakdownTasks: `${state.dataToBreakdownTasks}\n\nUser clarifications:\n${userClarifications}`,
        clarificationText: null,
        hasBeenClarified: true
    };
}

export async function breakdownTasksNode(state: GraphState) {
    console.log("--- START: breakdownTasksNode ---");
    const model = llmModel().withStructuredOutput(brokenDownTasksZodSchema);

    try {
        const response = await model.invoke([
            new HumanMessage(breakdownTasksPrompt(state.dataToBreakdownTasks!))
        ]);
        console.log("Tasks successfully broken down.");
        return { ...state, tasksBreakdown: response.tasks };
    }catch(error) {
        throw error;
    }
}

export async function finalEstimationNode(state: GraphState) {
    console.log("--- START: finalEstimationNode ---");
    const model = llmModel();

    const tasksWithHistory = state.tasksBreakdown!.map(t =>
        `Task: ${t.task}\nHistorical context: ${t.similarHistoricalTasks}`
    ).join("\n\n");

    const response = await model.invoke([
        new HumanMessage(`Estimate these tasks based on historical data:\n${tasksWithHistory}`)
    ]);

    console.log("--- Final estimation complete ---");
    return { ...state, finalResult: response.content };
}
