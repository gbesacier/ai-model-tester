import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAllPrompts, getPromptCount } from '@/lib/prompt-library';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized: You must be logged in to access this resource');
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const [prompts, count] = await Promise.all([
      getAllPrompts(limit, offset),
      getPromptCount(),
    ]);

    return NextResponse.json({
      prompts,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}
