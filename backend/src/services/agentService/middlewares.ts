import {createMiddleware, type WrapModelCallHandler} from "langchain";
import {responseStatuses} from "./responseStatuses.js";
import {
    clarificationOutputSchema,
    errorOutputSchema,
    estimationOutputSchema,
    otherOutputSchema
} from "./validationResponseSchemas.js";
import {parseClassifyLLMJson} from "../../utils/parseLLMResponse.js";
import {HumanMessage} from "@langchain/core/messages";

function isPlainObject(value: object) {
    return Object.prototype.toString.call(value) === '[object Object]';
}

async function validateHandler(handler: WrapModelCallHandler<undefined, never>, request: any) {
    console.log("-> Starting validation");
    const response = await handler(request);

    if(response?.response_metadata?.finish_reason !== 'stop') {
        return response;
    }

    const content = response.content;
    console.log("-> Parsing LLM JSON");
    console.log(`-> Raw content: ${content.toString()}, type: ${typeof content}`);
    const parsedContent = parseClassifyLLMJson(content.toString());
    console.log(`-> Parsed content: ${parsedContent}, type: ${typeof parsedContent}`);
    const contentJson = JSON.parse(parsedContent);
    console.log(`-> Validating content structure: ${contentJson}, type: ${typeof contentJson}`);

    if (!contentJson || !isPlainObject(contentJson)) {
        console.error("-> Invalid content structure");
        throw new Error("Response content is missing or not a plain object");
    }

    console.log(`-> Status: ${contentJson.status}`);
    switch (contentJson.status) {
        case responseStatuses.CLARIFICATION_REQUIRED: {
            clarificationOutputSchema.parse(contentJson);
            break;
        }
        case responseStatuses.READY_FOR_ESTIMATION: {
            estimationOutputSchema.parse(contentJson);
            break;
        }
        case responseStatuses.ERROR: {
            errorOutputSchema.parse(contentJson);
            break;
        }
        case responseStatuses.OTHER: {
            otherOutputSchema.parse(contentJson);
            break;
        }
        default: {
            console.error(`-> Unknown status: ${contentJson.status}`);
            throw new Error(`Unknown status: ${contentJson.status}`);
        }
    }

    console.log("-> Validation successful");
    return response;
}

export const createValidationAndRetryMiddleware = (maxRetries: number = 1) => {
    return createMiddleware({
        name: "ValidationAndRetryMiddleware",
        wrapModelCall: async (request, handler) => {
            let lastError = "";

            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    console.log(`Attempt ${attempt + 1} of ${maxRetries}`);
                    if (lastError) {
                        request.messages.push(new HumanMessage({
                            content: 'The previous attempt failed with the following error: ' + lastError + '. Please correct your response accordingly.'
                        }));
                    }

                    return await validateHandler(handler, request)
                } catch (e) {
                    const error = e as Error;
                    lastError = error.message;
                    if (attempt >= maxRetries) {
                        console.log(`Max retries reached (${maxRetries}). Throwing error. Last error: ${error.message}`);
                        throw error;
                    }
                    console.log(`Retry ${attempt + 1}/${maxRetries} after error: ${error.message}`);
                }
            }
            throw new Error("Unreachable");
        },
    });
};