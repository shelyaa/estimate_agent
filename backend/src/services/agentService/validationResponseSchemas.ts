import { z } from "zod";
import {responseStatuses} from "./responseStatuses.js";

export const clarificationOutputSchema = z.object({
    status: z.literal(responseStatuses.CLARIFICATION_REQUIRED),

    understood_requirements_summary: z.array(z.string()),

    missing_or_unclear_areas: z.array(
        z.object({
            area: z.string(),
            problem: z.string(),
        })
    ),

    clarification_questions: z.array(
        z.object({
            id: z.number(),
            priority: z.enum(["low", "medium", "high"]),
            question: z.string(),
        })
    ),
});

export const estimationOutputSchema = z.object({
    status: z.literal(responseStatuses.READY_FOR_ESTIMATION),

    tasks: z.array(
        z.object({
            task: z.string(),
            milestone: z.string(),

            estimate_hours: z.object({
                total: z.number().nonnegative(),

                front_view: z.number().nonnegative(),
                front_logic: z.number().nonnegative(),
                back_api: z.number().nonnegative(),
                back_logic: z.number().nonnegative(),
                database: z.number().nonnegative(),
                testing: z.number().nonnegative(),
                automation_test: z.number().nonnegative(),
                docs: z.number().nonnegative(),
                ui_design: z.number().nonnegative(),
                management: z.number().nonnegative(),
                risk: z.number().nonnegative(),
            }),

            historical_reference: z.string().optional(),
        })
    ),

    confidence: z.enum(["low", "medium", "high"]),

    risks: z.array(z.string()),

    unestimated_tasks: z.array(z.string()),

    attached_file: z.string().optional(),
});

export const errorOutputSchema = z.object({
    status: z.literal(responseStatuses.ERROR),
    message: z.string(),
});

export const otherOutputSchema = z.object({
    status: z.literal(responseStatuses.OTHER),
    details: z.string(),
});
