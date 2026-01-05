import {z} from "zod";

const interruptReasons = [
    "clarify_tasks",
] as const;

export const GraphStateSchema = z.object({
    pdfUrl: z.string(),
    dataToBreakdownTasks: z.string().nullable(),
    clarificationText: z.string().nullable(),
    hasBeenClarified: z.boolean().default(false),
    interruption: z.object({
        isInterrupted: z.boolean(),
        interruptReason: z.enum(interruptReasons),
    }).nullable(),
    tasksBreakdown: z.array(z.object({
        task: z.string(),
        milestone: z.string(),
        estimationHours: z.object({
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
            risk: z.number()
        }).nullable(),
        historicalReference: z.string().nullable(),
        similarHistoricalTasks: z.string().nullable(),
    })).nullable()
})

export type GraphState = z.infer<typeof GraphStateSchema>;
