'use server';

import { getServerSession } from 'next-auth';
import { gateway } from '@ai-sdk/gateway';
import { authOptions } from '@/lib/auth';

export interface ModelInfo {
  id: string;
  name: string;
  description?: string | null;
  inputPrice: string;
  outputPrice: string;
}

export async function fetchAvailableModels(): Promise<ModelInfo[]> {
  // Check if user is logged in
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized: You must be logged in to access this resource');
  }

  try {
    const { models } = await gateway.getAvailableModels();

    // Filter only language models and map to our ModelInfo format
    const languageModels = models
      .filter((model) => model.modelType === 'language')
      .map((model) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        inputPrice: model.pricing?.input || '0',
        outputPrice: model.pricing?.output || '0',
      }));

    return languageModels;
  } catch (error) {
    console.error('Failed to fetch models:', error);
    throw new Error('Failed to fetch available models');
  }
}
