export function parseClassifyLLMJson(raw: string) {
    try {
        const cleaned = String(raw)
            .trim()
            .replace(/```json|```/g, '');
        return cleaned;
    } catch {
        throw new Error('Failed to parse LLM response');
    }
}