'use server';

import { gateway } from '@ai-sdk/gateway';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function getGatewayCredits() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, balance: undefined, totalUsed: undefined };
  }

  try {
    const credits = await gateway.getCredits();
    return {
      success: true,
      balance: typeof credits.balance === 'string' ? parseFloat(credits.balance) : 0,
      totalUsed: typeof credits.totalUsed === 'string' ? parseFloat(credits.totalUsed) : 0,
    };
  } catch (error) {
    console.error('Failed to fetch gateway credits:', error);
    return {
      success: false,
      balance: undefined,
      totalUsed: undefined,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
