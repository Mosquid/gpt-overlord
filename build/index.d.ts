import { ChatCompletionRequestMessage } from "openai";
export interface GPTOverlordConfig {
    apiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    setupMessages?: Array<ChatCompletionRequestMessage>;
    schema?: Record<string, unknown> | null;
}
declare class GPTOverlord {
    private schema;
    private setupMessages;
    private chatGPTClient;
    private temperature;
    private model;
    private maxTokens?;
    constructor(params: GPTOverlordConfig);
    private isSet;
    private get enforceSchemaMessage();
    private parseMessage;
    /**
     * @param message string
     * @returns parsed JSON response from OpenAI API
     */
    prompt(message: string): Promise<any>;
}
export default GPTOverlord;
