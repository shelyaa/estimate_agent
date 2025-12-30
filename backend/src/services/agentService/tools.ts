import {tool} from "langchain";
import {z} from "zod";
import {getVectorStore} from "../../config/vectorStore.js";
import { processPdf } from "../pdfService.js";

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

export const pdfReaderTool = tool(getDataFromPdf, {
  name: "read_pdf_document",
  description: "Use this tool to read the contents of a PDF file. The path to the file is accepted as input.",
    schema: z.object({
        filePath: z.string().describe("Provided pdf path"),
    }),
});


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

async function getDataFromPdf({filePath}: {filePath: string}) {
  try {
    const data = await processPdf(filePath);

    return data || "The file is empty or the text could not be recognized.";
  } catch (error) {
    return `Error while reading PDF: ${error instanceof Error ? error.message : String(error)}`;
  }
}
