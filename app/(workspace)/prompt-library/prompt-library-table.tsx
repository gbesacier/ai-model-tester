'use client';

import { useEffect, useState } from 'react';
import { styles } from '@/components/styles';
import { Copy, Check, Zap, ChevronDown, ChevronUp } from 'lucide-react';
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

function CollapsedText({ text, label, expanded }: { text: string; label: string; expanded: boolean }) {
  return (
    <div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">{label}</span>
      <pre
        className="text-xs text-gray-700 whitespace-pre-wrap wrap-break-word font-mono bg-gray-50 rounded p-2 border border-gray-200 overflow-hidden"
        style={expanded ? undefined : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {text}
      </pre>
    </div>
  );
}

function CollapsedMessages({ messages, expanded }: { messages: any[]; expanded: boolean }) {
  const preview = expanded ? messages : messages.slice(0, 2);
  return (
    <div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
        Messages ({messages.length})
      </span>
      <div className="space-y-1">
        {preview.map((msg, idx) => (
          <div key={idx} className="bg-gray-50 rounded border border-gray-200 p-2 flex items-baseline gap-2">
            <span className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 shrink-0">
              {msg.role}
            </span>
            <span
              className="text-xs text-gray-700 font-mono min-w-0"
              style={expanded ? undefined : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-sm transition-shadow">
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-200">
        <code className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
          {prompt.promptHash.slice(0, 8)}
        </code>
        <span className="text-xs text-gray-400">{formatDate(prompt.created)}</span>
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          ×{prompt.usageCount}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 border border-gray-300 bg-white hover:bg-gray-50"
          >
            {expanded ? <><ChevronUp size={12} />Less</> : <><ChevronDown size={12} />More</>}
          </button>
          <button
            onClick={() => onCopy(prompt.promptHash, prompt.id)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 border border-gray-300 bg-white hover:bg-gray-50"
          >
            {copiedId === prompt.id ? (
              <><Check size={12} className="text-green-600" />Copied</>
            ) : (
              <><Copy size={12} />Hash</>
            )}
          </button>
          <Link
            href={`/tester?prompt=${prompt.promptHash}`}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
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
