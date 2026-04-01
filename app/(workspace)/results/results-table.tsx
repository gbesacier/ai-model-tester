'use client';

import { useState, useEffect } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { ArrowDownAz, ArrowDown01, ChevronDown, Edit2, Filter } from 'lucide-react';
import { CollapsedText, CollapsedMessages, ExpandToggleButton } from '@/components/prompt-display';
import Link from 'next/link';
import { getModelCalls, getAvailableModelsForResults, getAvailablePromptsForResults, type ModelCallResult, type SortBy, type SortOrder } from './actions';
import { styles } from '@/components/styles';


interface ResultCardProps {
  call: ModelCallResult;
  formatDate: (d: Date | null) => string;
  filterModelIds: string[];
  setFilterModelIds: (ids: string[]) => void;
  filterPromptHashes: string[];
  setFilterPromptHashes: (hashes: string[]) => void;
}

function FilterPinButton({
  active,
  onClick,
  title,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center rounded p-0.5 transition-colors ${
        active
          ? 'text-blue-600 bg-blue-100 hover:bg-blue-200'
          : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
      }`}
    >
      <Filter size={11} />
    </button>
  );
}

function ResultCard({ call, formatDate, filterModelIds, setFilterModelIds, filterPromptHashes, setFilterPromptHashes }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const params = Object.entries(call.parameters || {});
  const hasMiddle = !!(call.inputPrompt || (call.messages && call.messages.length > 0));

  const modelOnlyActive = filterModelIds.length === 1 && filterModelIds[0] === call.modelId;
  const promptOnlyActive = filterPromptHashes.length === 1 && filterPromptHashes[0] === call.promptHash;

  function toggleModelFilter() {
    setFilterModelIds(modelOnlyActive ? [] : [call.modelId]);
  }

  function togglePromptFilter() {
    setFilterPromptHashes(promptOnlyActive ? [] : [call.promptHash]);
  }

  return (
    <div className={styles.card.container}>
      {/* Header */}
      <div className={styles.card.header}>
        <span className="text-xs text-gray-400 shrink-0">{formatDate(call.created)}</span>
        <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-mono">{call.userEmail}</span>
        <span className="inline-flex items-center gap-1">
          <span className="text-xs font-medium text-gray-700">{call.modelName}</span>
          <FilterPinButton active={modelOnlyActive} onClick={toggleModelFilter} title={modelOnlyActive ? 'Clear model filter' : 'Show only this model'} />
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="text-xs text-gray-400">prompt</span>
          <code className={styles.card.hashBadge}>{call.promptHash.slice(0, 8)}</code>
          <FilterPinButton active={promptOnlyActive} onClick={togglePromptFilter} title={promptOnlyActive ? 'Clear prompt filter' : 'Show only this prompt'} />
        </span>
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
            className={styles.card.actionPrimary}
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
          <div className="space-y-2">
            <label className={styles.label.small}>
              Models {filterModelIds.length > 0 && <span className="text-blue-600 font-semibold">({filterModelIds.length})</span>}
            </label>
            <Listbox multiple value={filterModelIds} onChange={setFilterModelIds}>
              <ListboxButton className={`${styles.input.base} ${styles.listbox.button}`}>
                <span>{filterModelIds.length > 0 ? `${filterModelIds.length} selected` : 'All Models'}</span>
                <ChevronDown size={16} />
              </ListboxButton>
              <ListboxOptions anchor="bottom" className={styles.listbox.options}>
                <div className={styles.listbox.controlsHeader}>
                  <button
                    onClick={(e) => { e.preventDefault(); setFilterModelIds(availableModels.map((m) => m.id)); }}
                    className={styles.listbox.selectAll}
                  >
                    All
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); setFilterModelIds([]); }}
                    className={styles.listbox.selectNone}
                  >
                    None
                  </button>
                </div>
                {availableModels.map((model) => (
                  <ListboxOption
                    key={model.id}
                    value={model.id}
                    className={styles.listbox.option}
                  >
                    <span className={styles.listbox.optionCheckbox}>
                      <span className={styles.listbox.optionCheckmark}>✓</span>
                    </span>
                    <span className="text-sm">{model.name}</span>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </div>

          {/* Filter by Prompts */}
          <div className="space-y-2">
            <label className={styles.label.small}>
              Prompts {filterPromptHashes.length > 0 && <span className="text-blue-600 font-semibold">({filterPromptHashes.length})</span>}
            </label>
            <Listbox multiple value={filterPromptHashes} onChange={setFilterPromptHashes}>
              <ListboxButton className={`${styles.input.base} ${styles.listbox.button}`}>
                <span>{filterPromptHashes.length > 0 ? `${filterPromptHashes.length} selected` : 'All Prompts'}</span>
                <ChevronDown size={16} />
              </ListboxButton>
              <ListboxOptions anchor="bottom" className={styles.listbox.options}>
                <div className={styles.listbox.controlsHeader}>
                  <button
                    onClick={(e) => { e.preventDefault(); setFilterPromptHashes(availablePrompts.map((p) => p.hash)); }}
                    className={styles.listbox.selectAll}
                  >
                    All
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); setFilterPromptHashes([]); }}
                    className={styles.listbox.selectNone}
                  >
                    None
                  </button>
                </div>
                {availablePrompts.map((prompt) => (
                  <ListboxOption
                    key={prompt.hash}
                    value={prompt.hash}
                    className={styles.listbox.option}
                  >
                    <span className={styles.listbox.optionCheckbox}>
                      <span className={styles.listbox.optionCheckmark}>✓</span>
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-mono text-gray-400">{prompt.hash.slice(0, 8)}</span>
                      <span className="text-sm truncate">{prompt.systemPrompt.substring(0, 60)}{prompt.systemPrompt.length > 60 ? '…' : ''}</span>
                    </div>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
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
              <ResultCard
                key={call.id}
                call={call}
                formatDate={formatDate}
                filterModelIds={filterModelIds}
                setFilterModelIds={setFilterModelIds}
                filterPromptHashes={filterPromptHashes}
                setFilterPromptHashes={setFilterPromptHashes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
