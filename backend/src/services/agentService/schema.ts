import { z } from "zod";

export const ClarificationSchema = z.object({
  status: z.literal("clarification_required"),
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

export const EstimationSchema = z.object({
  status: z.literal("ready_for_estimation"),
  tasks: z.array(
    z.object({
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
    })
  ),
  confidence: z.enum(["low", "medium", "high"]),
  risks: z.array(z.string()),
});

export const AgentOutputSchema = z.union([
  ClarificationSchema,
  EstimationSchema,
]);
