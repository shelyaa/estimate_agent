import { tool } from "langchain";
import { z } from "zod";
import { getVectorStore } from "../../config/vectorStore.js";
import { processPdf } from "../pdfService.js";
import ExcelJS from 'exceljs';
import path from "path";
import fs from 'fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getHistoricalEstimatesTool = tool(getSimilarHistoricalEstimates, {
	name: "get_historical_estimates",
	description: "Get historical estimates for similar tasks",
	schema: z.object({
		tasksBreakDown: z
			.string()
			.array()
			.describe("List of tasks to get similar historical estimates for"),
	}),
});

export const pdfReaderTool = tool(getDataFromPdf, {
	name: "read_pdf_document",
	description:
		"Use this tool to read the contents of a PDF file. The path to the file is accepted as input.",
	schema: z.object({
		filePath: z.string().describe("Provided pdf path"),
	}),
});

export const createExcelTool = tool(createExcel, {
  name: 'create_excel',
  description: "Use this tool to create the excel file.",
  schema: z.object({
    status: z.string(),
    tasks: z.array(z.object({
      task: z.string(),
      milestone: z.string(),
      estimate_hours: z.object({
        total: z.number(),
        front_view: z.number(),
        front_logic: z.number(),
        back_api: z.number(),
        back_logic: z.number(),
        database: z.number(),
        testing: z.number(),
        automation_test: z.number(),
        docs: z.number(),
        ui_design: z.number(),
        management: z.number(),
        risk: z.number(),
      }),
      historical_reference: z.string(),
    })),
    confidence: z.string(),
    risks: z.array(z.string()),
  })
})

async function getSimilarHistoricalEstimates({
	tasksBreakDown,
}: {
	tasksBreakDown: string[];
}) {
	const { vectorStore } = getVectorStore();

	let output = "";

	for (const task of tasksBreakDown) {
		const result = await vectorStore.similaritySearchWithScore(task, 5);

		output += `Task: ${task}\n`;
		output += `Similar historical tasks:\n`;

		for (const [doc, score] of result) {
			if (score > 0.7) {
                output += `- Content: ${doc.pageContent}\nScore: ${score}\n\n`;
			}
		}

		output += `\n`;
	}

	return output;
}

async function getDataFromPdf({ filePath }: { filePath: string }) {
	try {
		const data = await processPdf(filePath);

		return data || "The file is empty or the text could not be recognized.";
	} catch (error) {
		return `Error while reading PDF: ${
			error instanceof Error ? error.message : String(error)
		}`;
	}
}


interface AgentResponse {
  "status": "ready_for_estimation",
  "tasks": [
    {
      "task": string,
      "milestone": string,
      "estimate_hours": {
        "total": number,
        "front_view": number,
        "front_logic": number,
        "back_api": number,
        "back_logic": number,
        "database": number,
        "testing": number,
        "automation_test": number,
        "docs": number,
        "ui_design": number,
        "management": number,
        "risk": number
      },
      "historical_reference": string
    }
  ],
  "confidence": string,
  "risks": string[]
}


async function createExcel(data: AgentResponse) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Estimate');

  sheet.columns = [
    { header: 'Task', key: 'task', width: 30 },
    { header: 'Milestone', key: 'milestone', width: 30 },
    { header: 'Total, hr.', key: 'total', width: 10 },
    { header: 'Front view, hr.', key: 'front_view', width: 10 },
    { header: 'Front logic, hr.', key: 'front_logic', width: 10 },
    { header: 'Back api, hr.', key: 'back_api', width: 10 },
    { header: 'Back logic, hr.', key: 'back_logic', width: 10 },
    { header: 'Database, hr.', key: 'database', width: 10 },
    { header: 'Testing, hr.', key: 'testing', width: 10 },
    { header: 'Automation test, hr.', key: 'automation_test', width: 10 },
    { header: 'Docs, hr.', key: 'docs', width: 10 },
    { header: 'UI Design, hr.', key: 'ui_design', width: 10 },
    { header: 'Management, hr.', key: 'management', width: 10 },
    { header: 'Risk, hr.', key: 'risk', width: 10 },
    { header: 'Historical ref.', key: 'historical_reference', width: 30},
    { header: 'Confidence', key: 'confidence', width: 30},
  ];

  const parsedData = data.tasks.map(task => {
    const estimate = task.estimate_hours;
    return {
      "task": task.task,
      "milestone": task.milestone,
      "total": estimate.total,
      "front_view": estimate.front_view,
      "front_logic": estimate.front_logic,
      "back_api": estimate.back_api,
      "back_logic": estimate.back_logic,
      "database": estimate.database,
      "testing": estimate.testing,
      "automation_test": estimate.automation_test,
      "docs": estimate.docs,
      "ui_design": estimate.ui_design,
      "management": estimate.management,
      "risk": estimate.risk,
      "historical_reference": task.historical_reference,
      "confidence": data.confidence
    }
  })

  sheet.addRows(parsedData);

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEEEEEE' }
  };

  const folderPath = path.join(__dirname, '../../estimates');
  const fileName = Date.now() + 'data.xlsx';
  const filePath = path.join(folderPath, fileName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  await workbook.xlsx.writeFile(filePath);
  console.log(`File: ${fileName} created successfully to ${folderPath}`);
  return filePath;
}