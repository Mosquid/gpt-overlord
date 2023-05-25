import {
  ChatCompletionRequestMessageRoleEnum,
  ChatCompletionResponseMessage,
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai";

export interface GPTOverlordConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  setupMessages?: Array<ChatCompletionRequestMessage>;
  schema?: Record<string, unknown> | null;
}

class GPTOverlord {
  private schema: Record<string, unknown> | null = {
    status: "success | error",
    data: "..",
  };
  private setupMessages: Array<ChatCompletionRequestMessage> = [];
  private chatGPTClient: OpenAIApi;
  private temperature = 0;
  private model = "gpt-4";
  private maxTokens?: number;

  constructor(params: GPTOverlordConfig) {
    const { schema, setupMessages, apiKey, maxTokens, temperature, model } =
      params;

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

    const config = new Configuration({
      apiKey: apiKey,
    });

    this.chatGPTClient = new OpenAIApi(config);
  }

  private isSet<T>(value: T): value is NonNullable<T> {
    return value !== undefined;
  }

  private get enforceSchemaMessage() {
    try {
      if (!this.schema) {
        return;
      }

      const jsonSchema = JSON.stringify(this.schema);

      return {
        content: `As an AI model it's important that you provide asnswers strictly following the schema: ${jsonSchema}. The receiving agent can only interpret answers that follow the schema. Any additional text information should be omitted.`,
        role: ChatCompletionRequestMessageRoleEnum.System,
      };
    } catch (error) {
      console.error("Failed to stringify schema", error);
    }
  }

  private parseMessage(message: ChatCompletionResponseMessage) {
    try {
      const content = JSON.parse(message.content);

      return content;
    } catch (error) {
      return message.content;
    }
  }

  /**
   * @param message string
   * @returns parsed JSON response from OpenAI API
   */
  public async prompt(message: string) {
    try {
      const messages = [
        ...this.setupMessages,
        { content: message, role: ChatCompletionRequestMessageRoleEnum.User },
      ];
      const response = await this.chatGPTClient.createChatCompletion({
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : error;
      console.error("OpenAI API request failed", errorMsg);
    }
  }
}

export default GPTOverlord;
