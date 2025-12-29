import {tool} from "langchain";
import {z} from "zod";
import {getVectorStore} from "../../config/vectorStore.js";

export const getHistoricalEstimatesTool = tool(
    getSimilarHistoricalEstimates,
    {
        name: "get_historical_estimates",
        description: "Get historical estimates for similar tasks",
        schema: z.object({
            tasksBreakDown: z.string().array().describe("List of tasks to get similar historical estimates for"),
        }),
    }
)

async function getSimilarHistoricalEstimates({tasksBreakDown}: {tasksBreakDown: string[]}) {
    const { vectorStore } = getVectorStore();

    let output = "";

    for (const task of tasksBreakDown) {
        const result = await vectorStore.similaritySearch(task, 5);

        output += `Task: ${task}\n`;
        output += `Similar historical tasks:\n`;

        for (const doc of result) {
            output += `- ${doc.pageContent}\n`;
        }

        output += `\n`;
    }

    return output;
}
