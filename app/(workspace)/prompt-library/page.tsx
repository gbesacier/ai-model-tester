'use client';

import { useEffect, useState } from 'react';
import { styles } from '@/components/styles';
import { Copy, Check, Zap } from 'lucide-react';
import Link from 'next/link';

interface Prompt {
  id: number;
  promptHash: string;
  systemPrompt: string;
  inputPrompt: string | null;
  messages: any[] | null;
  usageCount: number;
  created: string;
}

export default function PromptLibraryPage() {
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
        const response = await fetch(`/api/prompt-library?limit=${limit}&offset=${offset}`);
        if (!response.ok) {
          throw new Error('Failed to fetch prompts');
        }
        const data = await response.json();
        setPrompts(data.prompts);
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

  const truncateText = (text: string, maxLength: number = 150): string => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const formatDate = (dateString: string): string => {
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
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {prompts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">No prompts saved yet. Run model calls to build your library.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {prompt.promptHash.slice(0, 8)}...
                    </code>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      Used {prompt.usageCount} time{prompt.usageCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Added {formatDate(prompt.created)}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(prompt.promptHash, prompt.id)}
                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                  >
                    {copiedId === prompt.id ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy Hash
                      </>
                    )}
                  </button>
                  <Link
                    href={`/tester?prompt=${prompt.promptHash}`}
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Zap size={16} />
                    Use in Tester
                  </Link>
                </div>
              </div>

              {/* Card Content */}
              <div className="px-6 py-4 space-y-4">
                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    System Prompt
                  </label>
                  <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words font-mono">
                      {truncateText(prompt.systemPrompt)}
                    </pre>
                  </div>
                </div>

                {/* Input Prompt or Messages */}
                {prompt.inputPrompt ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Input Prompt
                    </label>
                    <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words font-mono">
                        {truncateText(prompt.inputPrompt)}
                      </pre>
                    </div>
                  </div>
                ) : prompt.messages ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Messages ({prompt.messages.length})
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {prompt.messages.map((msg, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded text-gray-700">
                              {msg.role}
                            </span>
                          </div>
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words font-mono">
                            {truncateText(msg.text)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {prompts.length > 0 && totalCount > limit && (
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 px-0 py-6">
          <div className="text-sm text-gray-600">
            Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount} prompts
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= totalCount}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
