import crypto from 'crypto';
import { db, promptLibrary } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

export interface RequestMessage {
  role: 'system' | 'assistant' | 'user';
  text: string;
  reasoning?: string;
}

export interface PromptEntry {
  systemPrompt: string;
  inputPrompt?: string;
  messages?: RequestMessage[];
}

/**
 * Generate a hash for a prompt combination to ensure uniqueness
 * Hash includes system prompt + either input prompt OR messages (not both)
 */
export function generatePromptHash(entry: PromptEntry): string {
  const content = JSON.stringify({
    systemPrompt: entry.systemPrompt,
    inputPrompt: entry.inputPrompt || null,
    messages: entry.messages || null,
  });

  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Save a prompt to the library if it doesn't already exist
 * Returns the prompt entry with its ID
 */
export async function saveOrGetPrompt(entry: PromptEntry): Promise<{
  id: number;
  promptHash: string;
  isNew: boolean;
}> {
  const promptHash = generatePromptHash(entry);

  // Check if prompt already exists
  const existing = await db
    .select({ id: promptLibrary.id })
    .from(promptLibrary)
    .where(eq(promptLibrary.promptHash, promptHash))
    .limit(1);

  if (existing.length > 0) {
    // Increment usage count
    await db
      .update(promptLibrary)
      .set({ usageCount: sql`${promptLibrary.usageCount} + 1` })
      .where(eq(promptLibrary.id, existing[0].id));

    return {
      id: existing[0].id,
      promptHash,
      isNew: false,
    };
  }

  // Create new prompt entry
  const result = await db
    .insert(promptLibrary)
    .values({
      promptHash,
      systemPrompt: entry.systemPrompt,
      inputPrompt: entry.inputPrompt || null,
      messages: entry.messages ? JSON.stringify(entry.messages) : null,
      usageCount: 1,
    })
    .returning({ id: promptLibrary.id });

  return {
    id: result[0].id,
    promptHash,
    isNew: true,
  };
}

/**
 * Get a prompt entry by ID
 */
export async function getPromptById(id: number) {
  const result = await db
    .select()
    .from(promptLibrary)
    .where(eq(promptLibrary.id, id))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return {
    ...result[0],
    messages: result[0].messages ? JSON.parse(result[0].messages as string) : null,
  };
}

/**
 * Get all prompts in the library with optional filtering
 */
export async function getAllPrompts(limit: number = 100, offset: number = 0) {
  const results = await db
    .select()
    .from(promptLibrary)
    .orderBy((t) => t.created)
    .limit(limit)
    .offset(offset);

  return results.map((r) => ({
    ...r,
    messages: r.messages ? JSON.parse(r.messages as string) : null,
  }));
}

/**
 * Get count of all prompts
 */
export async function getPromptCount() {
  const result = await db.select({ count: promptLibrary.usageCount }).from(promptLibrary);
  return result.length;
}
