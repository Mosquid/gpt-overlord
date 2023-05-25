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
  schema?: Record<string, unknown>;
}

class GPTOverlord {
  private schema: Record<string, unknown> = {
    status: "success | error",
    data: "..",
  };
  private setupMessages: Array<ChatCompletionRequestMessage> = [];
  private chatGPTClient: OpenAIApi;

  private get enforceSchemaMessage() {
    try {
      const jsonSchema = JSON.stringify(this.schema);

      return {
        content: `As AI model it's important that you provide asnswers strictly following the schema: ${jsonSchema}. Make sure your resonse contains nothing but the JSON object with the schema fields.`,
        role: ChatCompletionRequestMessageRoleEnum.System,
      };
    } catch (error) {
      console.error("Failed to stringify schema", error);
    }
  }

  constructor(params: GPTOverlordConfig) {
    const { schema, setupMessages, apiKey } = params;

    schema && (this.schema = schema);
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

  public parseMessage(message: ChatCompletionResponseMessage) {
    try {
      const content = JSON.parse(message.content);
      return content;
    } catch (error) {
      return message.content;
    }
  }

  public async prompt(message: string) {
    try {
      const messages = [
        ...this.setupMessages,
        { content: message, role: ChatCompletionRequestMessageRoleEnum.User },
      ];
      const response = await this.chatGPTClient.createChatCompletion({
        model: "gpt-4",
        temperature: 0,
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
