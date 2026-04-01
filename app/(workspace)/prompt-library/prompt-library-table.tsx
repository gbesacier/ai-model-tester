'use client';

import { useEffect, useState } from 'react';
import { styles } from '@/components/styles';
import { Copy, Check, Zap } from 'lucide-react';
import { CollapsedText, CollapsedMessages, ExpandToggleButton } from '@/components/prompt-display';
import Link from 'next/link';
import { getPrompts } from './actions';

interface Prompt {
  id: number;
  promptHash: string;
  systemPrompt: string;
  inputPrompt: string | null;
  messages: any[] | null;
  usageCount: number;
  created: Date | string;
}


function PromptCard({
  prompt,
  copiedId,
  onCopy,
  formatDate,
}: {
  prompt: Prompt;
  copiedId: number | null;
  onCopy: (text: string, id: number) => void;
  formatDate: (d: Date | string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={styles.card.container}>
      {/* Row header */}
      <div className={styles.card.header}>
        <code className={styles.card.hashBadge}>
          {prompt.promptHash.slice(0, 8)}
        </code>
        <span className="text-xs text-gray-400">{formatDate(prompt.created)}</span>
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          ×{prompt.usageCount}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <ExpandToggleButton expanded={expanded} onToggle={() => setExpanded((e) => !e)} />
          <button
            onClick={() => onCopy(prompt.promptHash, prompt.id)}
            className={styles.card.toggleButton}
          >
            {copiedId === prompt.id ? (
              <><Check size={12} className="text-green-600" />Copied</>
            ) : (
              <><Copy size={12} />Hash</>
            )}
          </button>
          <Link
            href={`/tester?prompt=${prompt.promptHash}`}
            className={styles.card.actionPrimary}
          >
            <Zap size={12} />
            Test
          </Link>
        </div>
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <div className="p-3">
          <CollapsedText text={prompt.systemPrompt} label="System" expanded={expanded} />
        </div>
        <div className="p-3">
          {prompt.inputPrompt ? (
            <CollapsedText text={prompt.inputPrompt} label="Input" expanded={expanded} />
          ) : prompt.messages ? (
            <CollapsedMessages messages={prompt.messages} expanded={expanded} />
          ) : (
            <span className="text-xs text-gray-400 italic">No input</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PromptLibraryTable() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const data = await getPrompts(limit, offset);
        setPrompts(data.prompts as Prompt[]);
        setTotalCount(data.total);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [offset, limit]);

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: Date | string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && prompts.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <p className="text-gray-600">Loading prompts...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {prompts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">No prompts saved yet. Run model calls to build your library.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              copiedId={copiedId}
              onCopy={copyToClipboard}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {prompts.length > 0 && totalCount > limit && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600">
            Showing {offset + 1}–{Math.min(offset + limit, totalCount)} of {totalCount}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= totalCount}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
