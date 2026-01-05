import {MemorySaver, START, END, StateGraph} from "@langchain/langgraph";
import {GraphStateSchema} from "./state.js";
import { Command } from "@langchain/langgraph";
import {
    breakdownTasksNode, checkRequirementsNode,
    clarifyUserRequirementsNode, finalEstimationNode,
    getDataFromPdfNode,
    getSimilarHistoricalEstimatesNode
} from "./nodes.js";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));


const GRAPH_NODES = {
    GET_DATA_FROM_PDF_NODE: 'GET_DATA_FROM_PDF_NODE',
    GET_SIMILAR_HISTORICAL_ESTIMATES_NODE: 'GET_SIMILAR_HISTORICAL_ESTIMATES_NODE',
    CHECK_REQUIREMENTS_NODE: 'CHECK_REQUIREMENTS_NODE',
    CLARIFY_USER_REQUIREMENTS_NODE: 'CLARIFY_USER_REQUIREMENTS_NODE',
    BREAKDOWN_TASKS_NODE: 'BREAKDOWN_TASKS_NODE',
    FINAL_ESTIMATION_NODE: 'FINAL_ESTIMATION_NODE'
} as const;

const checkpointer = SqliteSaver.fromConnString("./checkpoints.sqlite");

const graph = new StateGraph(GraphStateSchema);

graph
    .addNode(GRAPH_NODES.GET_DATA_FROM_PDF_NODE, getDataFromPdfNode)
    .addNode(GRAPH_NODES.BREAKDOWN_TASKS_NODE, breakdownTasksNode)
    .addNode(GRAPH_NODES.CLARIFY_USER_REQUIREMENTS_NODE, clarifyUserRequirementsNode)
    .addNode(GRAPH_NODES.CHECK_REQUIREMENTS_NODE, checkRequirementsNode)
    .addNode(GRAPH_NODES.FINAL_ESTIMATION_NODE, finalEstimationNode)
    .addNode(GRAPH_NODES.GET_SIMILAR_HISTORICAL_ESTIMATES_NODE, getSimilarHistoricalEstimatesNode)

    .addEdge(START, GRAPH_NODES.GET_DATA_FROM_PDF_NODE)
    .addEdge(GRAPH_NODES.GET_DATA_FROM_PDF_NODE, GRAPH_NODES.CHECK_REQUIREMENTS_NODE)
    .addConditionalEdges(
        GRAPH_NODES.CHECK_REQUIREMENTS_NODE,
        (state) =>
            (state.clarificationText ?
                GRAPH_NODES.CLARIFY_USER_REQUIREMENTS_NODE :
                GRAPH_NODES.BREAKDOWN_TASKS_NODE
            )
    )
    .addEdge(GRAPH_NODES.CLARIFY_USER_REQUIREMENTS_NODE, GRAPH_NODES.CHECK_REQUIREMENTS_NODE)
    .addEdge(GRAPH_NODES.BREAKDOWN_TASKS_NODE, GRAPH_NODES.GET_SIMILAR_HISTORICAL_ESTIMATES_NODE)
    .addEdge(GRAPH_NODES.GET_SIMILAR_HISTORICAL_ESTIMATES_NODE, GRAPH_NODES.FINAL_ESTIMATION_NODE)
    .addEdge(GRAPH_NODES.FINAL_ESTIMATION_NODE, END);

const workflow = graph.compile({ checkpointer });

async function main() {
    const config = { configurable: { thread_id: "1" } };

    console.log("=== STEP 1: Starting workflow with PDF ===");

    let result: any = await workflow.invoke(
        { pdfUrl: `${__dirname}/../../../../mocks/Example2.pdf` },
        config
    );

    if (result.__interrupt__) {
        console.log("\n=== STEP 2: Workflow waiting for clarification ===");
        console.log("Questions from LLM:");

        const clarification = JSON.parse(result.clarificationText);
        clarification.clarification_questions.forEach((q: any) => {
            console.log(`[${q.priority}] Q${q.id}: ${q.question}`);
        });

        const userAnswers = `
        1. Performance: Expected page load time < 2s; up to 100 concurrent users.
        2. Security: Basic JWT authentication, HTTPS, and bcrypt for passwords are sufficient.
        3. Scalability: Initial release doesn't require complex scalability; simple vertical scaling is fine.
        4. Scope: 'Deadline reminders' and 'statistics' are NOT in scope for MVP. 'Calendar view' is in scope but only as a frontend view (no Google Calendar sync).
        5. Roles: Only a standard single-user role is needed for now.
        6. Integrations: No third-party integrations or APIs required for the initial version.
        7. Database: PostgreSQL is preferred; low initial data volume (thousands of tasks, not millions).
        8. Deployment: Target is a simple Docker container running on a basic VPS or AWS EC2.
        `;

        console.log("\nUser providing answers...\n");

        result = await workflow.invoke(
            new Command({ resume: userAnswers }),
            config
        );

        console.log("\n=== WORKFLOW COMPLETED ===");
        console.log("Final result:", JSON.stringify(result, null, 2));
    }else {
        console.log('No interruption found bro')
    }
}

main();