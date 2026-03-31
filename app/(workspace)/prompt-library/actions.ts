'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAllPrompts, getPromptCount } from '@/lib/prompt-library';

export async function getPrompts(limit: number = 20, offset: number = 0) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized: You must be logged in to access this resource');
  }

  const [prompts, total] = await Promise.all([
    getAllPrompts(limit, offset),
    getPromptCount(),
  ]);

  return { prompts, total };
}
