import { Metadata } from 'next';
import LLMTesterForm from "./llm-tester-form";
import { getPromptByHash } from '@/lib/prompt-library';
import { getCallById } from './call';

export const metadata: Metadata = {
  title: 'Tester',
};

export default async function TesterPage({ searchParams }: { searchParams: Promise<{ callId?: string; model?: string; prompt?: string }> }) {
  const { callId: callIdParam, model: modelParam, prompt: promptHashParam } = await searchParams;

  const call = callIdParam ? await getCallById(parseInt(callIdParam)) : null;
  const initialPrompt = await getPromptByHash(call?.promptHash ?? promptHashParam ?? null);
  const initialModelId = call?.modelId ?? modelParam ?? ''
  return (
    <div className="bg-white rounded-xl p-8 shadow">
      <LLMTesterForm initialPrompt={initialPrompt} initialCall={call} initialModelId={initialModelId} />
    </div>
  );
}
