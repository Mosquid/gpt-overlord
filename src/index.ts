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
        // Credits to Olup (https://github.com/olup/zod-chatgpt/blob/master/src/utils.ts)
        content: `Output a JSON object or array that matches this schema, based on user input. Code only, no comments, no introductory sentence, no codefence block  

        ## Schema  
        \`\`\`json
        ${jsonSchema}
        \`\`\``,
        role: ChatCompletionRequestMessageRoleEnum.System,
      };
    } catch (error) {
      console.error("Failed to stringify schema", error);
    }
  }

  private parseMessage(message: ChatCompletionResponseMessage) {
    try {
      const regex = /{(?:[^{}]|{[^{}]*})*}/;
      const { content } = message;
      const match = content.match(regex);
      const [json] = match || [];

      if (!json) {
        return content;
      }

      return JSON.parse(json);
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
