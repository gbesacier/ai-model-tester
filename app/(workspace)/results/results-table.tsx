'use client';

import { useState, useEffect } from 'react';
import { ArrowDownAz, ArrowDown01, ChevronDown, ChevronRight, Edit2 } from 'lucide-react';
import { CollapsedText, CollapsedMessages, ExpandToggleButton } from '@/components/prompt-display';
import Link from 'next/link';
import { getModelCalls, getAvailableModelsForResults, getAvailablePromptsForResults, type ModelCallResult, type SortBy, type SortOrder } from './actions';
import { styles } from '@/components/styles';


function ResultCard({ call, formatDate }: { call: ModelCallResult; formatDate: (d: Date | null) => string }) {
  const [expanded, setExpanded] = useState(false);
  const params = Object.entries(call.parameters || {});
  const hasMiddle = !!(call.inputPrompt || (call.messages && call.messages.length > 0));

  return (
    <div className={styles.card.container}>
      {/* Header */}
      <div className={styles.card.header}>
        <span className="text-xs text-gray-400 shrink-0">{formatDate(call.created)}</span>
        <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-mono">{call.userEmail}</span>
        <span className="text-xs font-medium text-gray-700">{call.modelName}</span>
        <code className={styles.card.hashBadge}>
          {call.promptHash.slice(0, 8)}
        </code>
        {params.map(([k, v]) => (
          <span key={k} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono">
            {k}={v !== null && v !== undefined ? String(v) : '—'}
          </span>
        ))}
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          {call.rating !== null ? (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              ★ {call.rating}
            </span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
          <ExpandToggleButton expanded={expanded} onToggle={() => setExpanded((e) => !e)} />
          <Link
            href={`/tester?callId=${call.id}`}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Edit2 size={12} />
            Edit
          </Link>
        </div>
      </div>

      {/* Body — always 3 cols when middle exists, else 2 */}
      <div className={`grid divide-x divide-gray-200 ${hasMiddle ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <div className="p-3">
          <CollapsedText text={call.systemPrompt} label="System" expanded={expanded} />
        </div>
        {hasMiddle && (
          <div className="p-3">
            {call.messages && call.messages.length > 0 ? (
              <CollapsedMessages messages={call.messages} expanded={expanded} />
            ) : (
              <CollapsedText text={call.inputPrompt!} label="Input" expanded={expanded} />
            )}
          </div>
        )}
        <div className="p-3">
          <CollapsedText text={call.result} label="Result" expanded={expanded} />
        </div>
      </div>
    </div>
  );
}

export default function ResultsTable() {
  const [calls, setCalls] = useState<ModelCallResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterModelIds, setFilterModelIds] = useState<string[]>([]);
  const [filterPromptHashes, setFilterPromptHashes] = useState<string[]>([]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showPromptDropdown, setShowPromptDropdown] = useState(false);

  const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>([]);
  const [availablePrompts, setAvailablePrompts] = useState<
    { hash: string; systemPrompt: string; inputPrompt: string | null }[]
  >([]);

  const formatDate = (d: Date | null): string => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [callsData, modelsData, promptsData] = await Promise.all([
          getModelCalls(
            sortBy,
            sortOrder,
            filterModelIds.length > 0 ? filterModelIds : undefined,
            filterPromptHashes.length > 0 ? filterPromptHashes : undefined
          ),
          getAvailableModelsForResults(),
          getAvailablePromptsForResults(),
        ]);
        setCalls(callsData);
        setAvailableModels(modelsData);
        setAvailablePrompts(promptsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sortBy, sortOrder, filterModelIds, filterPromptHashes]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p className="text-gray-600">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className={styles.error}>{error}</div>}

      {/* Filters and Sorting */}
      <div className={styles.container.sectionBase}>
        <label className={styles.label.base}>Filters & Sorting</label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sort by */}
          <div className="space-y-2">
            <label className={styles.label.small}>Sort By</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('date')}
                className={sortBy === 'date' ? styles.button.filter : styles.button.filterInactive}
              >
                <ArrowDownAz size={16} /> Date
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={sortBy === 'rating' ? styles.button.filter : styles.button.filterInactive}
              >
                <ArrowDown01 size={16} /> Rating
              </button>
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className={styles.label.small}>Order</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortOrder('desc')}
                className={sortOrder === 'desc' ? styles.button.secondary : styles.button.secondaryInactive}
              >
                Descending
              </button>
              <button
                onClick={() => setSortOrder('asc')}
                className={sortOrder === 'asc' ? styles.button.secondary : styles.button.secondaryInactive}
              >
                Ascending
              </button>
            </div>
          </div>

          {/* Filter by Models */}
          <div className="space-y-2 relative">
            <label className={styles.label.small}>
              Models {filterModelIds.length > 0 && <span className="text-blue-600 font-semibold">({filterModelIds.length})</span>}
            </label>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className={`${styles.input.base} w-full text-left flex items-center justify-between`}
            >
              <span>{filterModelIds.length > 0 ? `${filterModelIds.length} selected` : 'All Models'}</span>
              {showModelDropdown ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {showModelDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                <div className="p-2 border-b border-gray-200 flex gap-2 sticky top-0 bg-white">
                  <button
                    onClick={() => setFilterModelIds(availableModels.map((m) => m.id))}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterModelIds([])}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    None
                  </button>
                </div>
                {availableModels.map((model) => (
                  <label
                    key={model.id}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filterModelIds.includes(model.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterModelIds([...filterModelIds, model.id]);
                        } else {
                          setFilterModelIds(filterModelIds.filter((id) => id !== model.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{model.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filter by Prompts */}
          <div className="space-y-2 relative">
            <label className={styles.label.small}>
              Prompts {filterPromptHashes.length > 0 && <span className="text-blue-600 font-semibold">({filterPromptHashes.length})</span>}
            </label>
            <button
              onClick={() => setShowPromptDropdown(!showPromptDropdown)}
              className={`${styles.input.base} w-full text-left flex items-center justify-between`}
            >
              <span>{filterPromptHashes.length > 0 ? `${filterPromptHashes.length} selected` : 'All Prompts'}</span>
              {showPromptDropdown ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {showPromptDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                <div className="p-2 border-b border-gray-200 flex gap-2 sticky top-0 bg-white">
                  <button
                    onClick={() => setFilterPromptHashes(availablePrompts.map((p) => p.hash))}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterPromptHashes([])}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    None
                  </button>
                </div>
                {availablePrompts.map((prompt) => (
                  <label
                    key={prompt.hash}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filterPromptHashes.includes(prompt.hash)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterPromptHashes([...filterPromptHashes, prompt.hash]);
                        } else {
                          setFilterPromptHashes(filterPromptHashes.filter((h) => h !== prompt.hash));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm truncate max-w-xs">
                      {prompt.systemPrompt.substring(0, 50)}
                      {prompt.systemPrompt.length > 50 ? '...' : ''}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Cards */}
      <div className={styles.container.sectionBase}>
        <label className={styles.label.base}>
          Results ({calls.length})
        </label>

        {calls.length === 0 ? (
          <p className={styles.text.muted}>No results found</p>
        ) : (
          <div className="grid gap-3">
            {calls.map((call) => (
              <ResultCard key={call.id} call={call} formatDate={formatDate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
