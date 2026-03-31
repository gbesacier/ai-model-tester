'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db, modelCalls, models, promptLibrary } from '@/lib/db';
import { eq, and, desc, asc, SQL, inArray } from 'drizzle-orm';

export interface ModelCallResult {
  id: number;
  userEmail: string;
  modelName: string;
  modelId: string;
  promptHash: string;
  systemPrompt: string;
  inputPrompt: string | null;
  parameters: Record<string, any>;
  result: string;
  rating: number | null;
  created: Date | null;
}

export type SortBy = 'date' | 'rating';
export type SortOrder = 'asc' | 'desc';

export async function getModelCalls(
  sortBy: SortBy = 'date',
  sortOrder: SortOrder = 'desc',
  filterModelIds?: string[],
  filterPromptHashes?: string[]
): Promise<ModelCallResult[]> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized: You must be logged in to access this resource');
  }


  try {
    // Build where conditions
    const whereConditions: SQL[] = [];
    if (filterModelIds && filterModelIds.length > 0) {
      whereConditions.push(inArray(models.id, filterModelIds));
    }
    if (filterPromptHashes && filterPromptHashes.length > 0) {
      whereConditions.push(inArray(modelCalls.promptHash, filterPromptHashes));
    }

    // Apply sorting
    const orderColumn = sortBy === 'rating' ? modelCalls.rating : modelCalls.created;
    const orderFn = sortOrder === 'desc' ? desc : asc;

    // Build the base query
    const baseSelect = db
      .select({
        id: modelCalls.id,
        userEmail: modelCalls.userEmail,
        modelName: models.name,
        modelId: models.id,
        promptHash: modelCalls.promptHash,
        systemPrompt: promptLibrary.systemPrompt,
        inputPrompt: promptLibrary.inputPrompt,
        parameters: modelCalls.parameters,
        result: modelCalls.result,
        rating: modelCalls.rating,
        created: modelCalls.created,
      })
      .from(modelCalls)
      .innerJoin(models, eq(modelCalls.modelId, models.id))
      .innerJoin(promptLibrary, eq(modelCalls.promptHash, promptLibrary.promptHash));

    // Apply filters and ordering based on conditions
    const query = whereConditions.length > 0
      ? baseSelect.where(and(...(whereConditions as Parameters<typeof and>))).orderBy(orderFn(orderColumn))
      : baseSelect.orderBy(orderFn(orderColumn));

    const results = await query;
    return results as ModelCallResult[];
  } catch (error) {
    console.error('Failed to fetch model calls:', error);
    throw new Error(`Failed to fetch model calls: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getAvailableModelsForResults(): Promise<{ id: string; name: string }[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  try {
    const results = await db
      .selectDistinct({
        id: models.id,
        name: models.name,
      })
      .from(modelCalls)
      .innerJoin(models, eq(modelCalls.modelId, models.id))
      .orderBy(asc(models.name));

    return results;
  } catch (error) {
    console.error('Failed to fetch available models:', error);
    throw new Error('Failed to fetch available models');
  }
}

export async function getAvailablePromptsForResults(): Promise<
  { hash: string; systemPrompt: string; inputPrompt: string | null }[]
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  try {
    const results = await db
      .selectDistinct({
        hash: modelCalls.promptHash,
        systemPrompt: promptLibrary.systemPrompt,
        inputPrompt: promptLibrary.inputPrompt,
      })
      .from(modelCalls)
      .innerJoin(promptLibrary, eq(modelCalls.promptHash, promptLibrary.promptHash))
      .orderBy(asc(promptLibrary.systemPrompt));

    return results;
  } catch (error) {
    console.error('Failed to fetch available prompts:', error);
    throw new Error('Failed to fetch available prompts');
  }
}
