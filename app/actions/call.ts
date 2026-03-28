import { generateText, type ModelMessage } from 'ai';
import { gateway, GatewayProviderOptions } from '@ai-sdk/gateway';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';


export interface RequestMessage {
  id: string;
  role: 'system' | 'assistant' | 'user';
  text: string;
  reasoning?: string;
}

export interface ModelCallRequest {
  modelId: string;
  provider: string;
  systemPrompt: string;
  inputPrompt: string;
  messages: RequestMessage[];
  parameters: {
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
  };
}

export async function callModel(request: ModelCallRequest): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized: You must be logged in to access this resource');
  }

  try {
    // Build conversation history messages if needed
    let conversationMessages: ModelMessage[] | undefined;
    if (request.messages.length > 0) {
      conversationMessages = [];
      for (const msg of request.messages) {
        // Handle assistant messages with reasoning
        if (msg.role === 'assistant' && msg.reasoning) {
          conversationMessages.push({
            role: 'assistant',
            content: msg.reasoning && msg.text ? `[Reasoning]\n${msg.reasoning}\n\n[Response]\n${msg.text}` : msg.text,
          });
        } else {
          conversationMessages.push({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.text,
          });
        }
      }
    }

    // Build all params (including undefined ones)
    const commonParams: Parameters<typeof generateText>[0] = {
      model: gateway.languageModel(request.modelId),
      providerOptions: {
        gateway: {
          order: [request.provider],
        } satisfies GatewayProviderOptions,
      },
      system: request.systemPrompt,
      prompt: request.inputPrompt,
      temperature: request.parameters.temperature,
      topP: request.parameters.topP,
      topK: request.parameters.topK,
      frequencyPenalty: request.parameters.frequencyPenalty,
      presencePenalty: request.parameters.presencePenalty,
    };

    // Remove undefined values from common params
    const cleanCommonParams = Object.fromEntries(
      Object.entries(commonParams).filter(([, value]) => value !== undefined)
    ) as Parameters<typeof generateText>[0];

    if (conversationMessages) {
      cleanCommonParams.messages = conversationMessages;
    }

    // Ensure only one of prompt or messages is provided, not both
    const hasPrompt = !!cleanCommonParams.prompt;
    const hasMessages = cleanCommonParams.messages && cleanCommonParams.messages.length > 0;

    if (hasPrompt && hasMessages) {
      throw new Error('Cannot provide both prompt and messages. Please use either input prompt or conversation history, not both.');
    }

    if (!hasPrompt && !hasMessages) {
      throw new Error('Must provide either a prompt or messages. Please use either input prompt or conversation history.');
    }

    // Call the model
    const response = await generateText(cleanCommonParams);

    return response.text;
  } catch (error) {
    console.error('Failed to call model:', error);
    throw new Error(`Failed to call model: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

