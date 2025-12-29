import { z } from "zod";

export const AgentStateSchema = z.object({
  pdfText: z.string(),

  requirements: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      clarity: z.enum(["clear", "unclear"]),
      missingInfo: z.array(z.string()),
    })
  ).default([]),

  clarificationQuestions: z.array(z.string()).default([]),
  clarificationsAnswered: z.boolean().default(false),

  estimates: z.array(
    z.object({
      task: z.string(),
      hours: z.number(),
      source: z.string(),
    })
  ).default([]),

  finalEstimate: z.object({
    totalHours: z.number(),
    confidence: z.enum(["low", "medium", "high"]),
    risks: z.array(z.string()),
  }).optional(),
});

export type AgentState = z.infer<typeof AgentStateSchema>;
