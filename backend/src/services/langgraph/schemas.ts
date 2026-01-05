import {z} from 'zod'

export const clarifiedTextZodSchema = z.object({
    understood_requirements_summary: z.array(z.string()),
    missing_or_unclear_areas: z.array(
        z.object({
            area: z.string(),
            problem: z.string()
        })
    ),
    clarification_questions: z.array(
        z.object({
            id: z.number(),
            priority: z.string(),
            question: z.string()
        })
    )
})

export const brokenDownTasksZodSchema = z.object({
    tasks: z.array(
        z.object({
            task: z.string().describe("Task name or description"),
            milestone: z.string().describe("Milestone name or description")
        })
    ),
});
