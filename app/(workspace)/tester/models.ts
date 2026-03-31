'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, models, modelProviders } from '@/lib/db';
import { eq } from 'drizzle-orm';

const GATEWAY_BASE_URL = 'https://ai-gateway.vercel.sh/v1';
const PRICE_FACTOR = 1_000_000_000_000;

export interface ModelProviderInfo {
  provider: string;
  inputPrice: number;
  outputPrice: number;
  contextLength: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string | null;
  reasoning: boolean;
  created?: Date;
  providers: ModelProviderInfo[];
}

async function populateModelsFromAPI(): Promise<void> {
  try {
    // Fetch all available models
    const modelsResponse = await fetch(`${GATEWAY_BASE_URL}/models`);

    if (!modelsResponse.ok) {
      throw new Error(`Failed to fetch models: ${modelsResponse.statusText}`);
    }

    const { data: allModels } = await modelsResponse.json() as { 
      object: string;
      data: Array<{ 
        id: string; 
        name: string; 
        description?: string; 
        type?: string;
        created?: number;
        released?: number;
        context_window?: number;
        max_tokens?: number;
        tags?: string[];
      }> 
    };

    const languageModels = allModels.filter((model) => model.type === 'language');

    await db.insert(models).values(
      languageModels.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description,
        created: model.released ? new Date(model.released * 1000) : undefined,
        reasoning: model.tags?.includes('reasoning') || false,
      }))
    );

    // Fetch and collect all models details in parallel
    const allProviders: Array<{
      modelId: string;
      provider: string;
      inputPrice: number;
      outputPrice: number;
      contextLength: number;
    }> = [];

    await Promise.all(languageModels.map(async (model) => {
      try {
        const providersResponse = await fetch(`${GATEWAY_BASE_URL}/models/${model.id}/endpoints`);

        if (!providersResponse.ok) {
          console.error(`Failed to fetch endpoints for model ${model.id}: ${providersResponse.statusText}`);
          return;
        }

        const { data: modelData } = await providersResponse.json() as { 
          data?: {
            endpoints?: Array<{ 
              provider_name: string; 
              pricing?: { prompt?: string; completion?: string }; 
              context_length?: number;
            }> 
          }
        };
        
        // Collect each endpoint's data
        (modelData?.endpoints || []).forEach(endpoint => {
          allProviders.push({
            modelId: model.id,
            provider: endpoint.provider_name,
            inputPrice: Math.round(parseFloat(endpoint.pricing?.prompt || '0') * PRICE_FACTOR),
            outputPrice: Math.round(parseFloat(endpoint.pricing?.completion || '0') * PRICE_FACTOR),
            contextLength: endpoint.context_length || 0,
          });
        });
      } catch (error) {
        console.error(`Failed to fetch endpoints for model ${model.id}:`, error);
      }
    }));

    if (allProviders.length > 0) {
      await db.insert(modelProviders).values(allProviders);
    }
  } catch (error) {
    console.error('Failed to populate models from API:', error);
    throw new Error('Failed to populate models database');
  }
}

export async function fetchAvailableModels(): Promise<ModelInfo[]> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized: You must be logged in to access this resource');
  }

  try {
    const existingModels = await db.select().from(models).limit(1);
    if (existingModels.length === 0) {
      await populateModelsFromAPI();
    }

    const rows = await db.select({
      id: models.id,
      name: models.name,
      description: models.description,
      reasoning: models.reasoning,
      created: models.created,
      provider: modelProviders.provider,
      inputPrice: modelProviders.inputPrice,
      outputPrice: modelProviders.outputPrice,
      contextLength: modelProviders.contextLength,
    })
    .from(models)
    .innerJoin(modelProviders, eq(models.id, modelProviders.modelId));

    const results = rows.reduce<Record<string, ModelInfo>>((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          name: row.name,
          description: row.description,
          reasoning: row.reasoning,
          created: row.created || undefined,
          providers: [],
        };
      }

      acc[row.id].providers.push({
        provider: row.provider,
        inputPrice: (row.inputPrice||0) / (PRICE_FACTOR/1_000_000), // Convert back to dollars per million tokens
        outputPrice: (row.outputPrice||0) / (PRICE_FACTOR/1_000_000),
        contextLength: row.contextLength,
      });

      return acc;
    }, {});
    
    return Object.values(results);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    throw new Error('Failed to fetch available models');
  }
}
