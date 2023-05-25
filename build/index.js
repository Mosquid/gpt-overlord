"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
class GPTOverlord {
    constructor(params) {
        this.schema = {
            status: "success | error",
            data: "..",
        };
        this.setupMessages = [];
        this.temperature = 0;
        this.model = "gpt-4";
        const { schema, setupMessages, apiKey, maxTokens, temperature, model } = params;
        this.maxTokens = maxTokens;
        if (this.isSet(temperature)) {
            this.temperature = temperature;
        }
        if (this.isSet(model)) {
            this.model = model;
        }
        if (this.isSet(schema)) {
            this.schema = schema;
        }
        const schemaMessage = this.enforceSchemaMessage;
        this.setupMessages = setupMessages || [];
        if (schemaMessage) {
            this.setupMessages.unshift(schemaMessage);
        }
        const config = new openai_1.Configuration({
            apiKey: apiKey,
        });
        this.chatGPTClient = new openai_1.OpenAIApi(config);
    }
    isSet(value) {
        return value !== undefined;
    }
    get enforceSchemaMessage() {
        try {
            if (!this.schema) {
                return;
            }
            const jsonSchema = JSON.stringify(this.schema);
            return {
                content: `As an AI model it's important that you provide asnswers strictly following the schema: ${jsonSchema}. The receiving agent can only interpret answers that follow the schema. Any additional text information should be omitted.`,
                role: openai_1.ChatCompletionRequestMessageRoleEnum.System,
            };
        }
        catch (error) {
            console.error("Failed to stringify schema", error);
        }
    }
    parseMessage(message) {
        try {
            const content = JSON.parse(message.content);
            return content;
        }
        catch (error) {
            return message.content;
        }
    }
    /**
     * @param message string
     * @returns parsed JSON response from OpenAI API
     */
    prompt(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messages = [
                    ...this.setupMessages,
                    { content: message, role: openai_1.ChatCompletionRequestMessageRoleEnum.User },
                ];
                const response = yield this.chatGPTClient.createChatCompletion({
                    model: this.model,
                    temperature: this.temperature,
                    max_tokens: this.maxTokens,
                    messages,
                });
                const { message: answer } = response.data.choices[0];
                if (!answer) {
                    throw new Error("OpenAI API response is empty");
                }
                return this.parseMessage(answer);
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : error;
                console.error("OpenAI API request failed", errorMsg);
            }
        });
    }
}
exports.default = GPTOverlord;
