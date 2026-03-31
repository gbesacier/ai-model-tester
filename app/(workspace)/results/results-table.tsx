'use client';

import { useState, useEffect } from 'react';
import { ArrowDownAz, ArrowDown01, ChevronDown, ChevronRight, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { getModelCalls, getAvailableModelsForResults, getAvailablePromptsForResults, type ModelCallResult, type SortBy, type SortOrder } from './actions';
import { styles } from '@/components/styles';

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

      {/* Results Table */}
      <div className={styles.container.sectionBase}>
        <label className={styles.label.base}>
          Results ({calls.length})
        </label>

        {calls.length === 0 ? (
          <p className={styles.text.muted}>No results found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Model</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Prompt</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Parameters</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Result</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-900">Rating</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call, idx) => (
                  <tr
                    key={call.id}
                    className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}
                  >
                    <td className="px-4 py-3 text-gray-700">
                      {call.created ? new Date(call.created).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">{call.userEmail}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="font-medium">{call.modelName}</span>
                      <div className="text-xs text-gray-500">{call.modelId}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="text-xs max-w-xs">
                        <div className="font-medium mb-1">System:</div>
                        <div className="truncate">{call.systemPrompt}</div>
                        {call.inputPrompt && (
                          <>
                            <div className="font-medium mt-2 mb-1">Input:</div>
                            <div className="truncate">{call.inputPrompt}</div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="text-xs space-y-1 max-w-xs">
                        {Object.entries(call.parameters).map(([key, value]) => (
                          <div key={key} className="text-gray-600">
                            <span className="font-medium">{key}:</span> {value !== undefined && value !== null ? String(value) : '—'}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="text-xs max-w-xs truncate" title={call.result}>
                        {call.result}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {call.rating !== null ? (
                        <span className="inline-block px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold">
                          {call.rating}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/workspace/tester?callId=${call.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-700 px-3 py-2 text-xs font-medium hover:bg-blue-200"
                      >
                        <Edit2 size={14} />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
