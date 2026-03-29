'use server';

import { generateText, type ModelMessage } from 'ai';
import { gateway, GatewayProviderOptions } from '@ai-sdk/gateway';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { saveOrGetPrompt, type RequestMessage, generatePromptHash } from '@/lib/prompt-library';
import { db, modelCalls } from '@/lib/db';


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

    // Save prompt to library and get its hash
    let promptHash: string;
    try {
      promptHash = generatePromptHash({
        systemPrompt: request.systemPrompt,
        inputPrompt: request.inputPrompt || undefined,
        messages: request.messages.length > 0 ? request.messages : undefined,
      });

      await saveOrGetPrompt({
        systemPrompt: request.systemPrompt,
        inputPrompt: request.inputPrompt || undefined,
        messages: request.messages.length > 0 ? request.messages : undefined,
      });
    } catch (error) {
      console.error('Failed to save prompt to library:', error);
      // Don't throw - prompt library is optional, model call succeeded
      promptHash = '';
    }

    // Save model call to database
    try {
      if (session?.user?.email && promptHash) {
        await db.insert(modelCalls).values({
          userEmail: session.user.email,
          modelId: request.modelId,
          promptHash,
          parameters: request.parameters,
          result: response.text,
          rating: null,
        });
      }
    } catch (error) {
      console.error('Failed to save model call to database:', error);
      // Don't throw - database save is optional, model call succeeded
    }

    return response.text;
  } catch (error) {
    console.error('Failed to call model:', error);
    throw new Error(`Failed to call model: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

