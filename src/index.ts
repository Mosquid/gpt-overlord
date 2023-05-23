import { Configuration, OpenAIApi } from "openai";
import { ChatCompletionRequestMessage } from "openai";

export interface GPTOverlordConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  setupMessages: Array<ChatCompletionRequestMessage>;
  schema?: Record<string, unknown>;
}

class GPTOverlord {
  private schema;
  private setupMessages;
  private chatClient: OpenAIApi;

  constructor(params: GPTOverlordConfig) {
    const { schema, setupMessages, apiKey } = params;

    this.schema = schema;
    this.setupMessages = setupMessages;

    const config = new Configuration({
      apiKey: apiKey,
    });

    this.chatClient = new OpenAIApi(config);
  }

  public async prompt(message: string): Promise<string> {
    const messages: Array<ChatCompletionRequestMessage> = [
      ...this.setupMessages,
      {
        content: message,
        role: "user",
      },
    ];

    return message;
  }
}

export default GPTOverlord;
