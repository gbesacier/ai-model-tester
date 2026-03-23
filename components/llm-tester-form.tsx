'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Trash2, Plus, ArrowDownAz, ArrowDown01 } from 'lucide-react';
import { fetchAvailableModels, type ModelInfo } from '@/app/actions/models';
import { styles } from '@/components/styles';

interface Message {
  id: string;
  role: 'system' | 'assistant' | 'user';
  text: string;
  reasoning?: string;
}

interface ParameterValue {
  type: 'default' | 'custom';
  value?: number;
}

export default function LLMTesterForm() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [modelSearchInput, setModelSearchInput] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [modelSortBy, setModelSortBy] = useState<'name' | 'price'>('price');
  const [minContextLength, setMinContextLength] = useState<number | null>(null);
  const [filterReasoning, setFilterReasoning] = useState(false);

  const [systemPrompt, setSystemPrompt] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const [parameters, setParameters] = useState<{
    maxOutputTokens: ParameterValue;
    temperature: ParameterValue;
    topP: ParameterValue;
    topK: ParameterValue;
    presencePenalty: ParameterValue;
    frequencyPenalty: ParameterValue;
  }>({
    maxOutputTokens: { type: 'default' },
    temperature: { type: 'default' },
    topP: { type: 'default' },
    topK: { type: 'default' },
    presencePenalty: { type: 'default' },
    frequencyPenalty: { type: 'default' },
  });

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const models = await fetchAvailableModels();
        setModels(models);
      } catch (err) {
        setError('Failed to fetch models. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  const currentModel = models.find((m) => m.id === selectedModelId);
  const currentProvider = currentModel?.providers.find((p) => p.provider === selectedProvider);

  const sortedModels = useMemo(() => {
    return [...models].sort((a, b) => {
      if (modelSortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (modelSortBy === 'price') {
        const aTotal = Math.min(...a.providers.map((p) => p.inputPrice + p.outputPrice));
        const bTotal = Math.min(...b.providers.map((p) => p.inputPrice + p.outputPrice));
        return aTotal - bTotal;
      } else {
        throw new Error('Invalid sort option');
      }
    })
  }, [models, modelSortBy]);

  const filteredModels = useMemo(() => {
    return sortedModels.filter((model) => {
      const matchesSearch = model.name.toLowerCase().includes(modelSearchInput.toLowerCase());
      const matchesContext = minContextLength ? Math.max(...model.providers.map((p) => p.contextLength)) >= minContextLength : true;
      const matchesReasoning = !filterReasoning || model.reasoning;
      return matchesSearch && matchesContext && matchesReasoning;
    });
  }, [sortedModels, modelSearchInput, minContextLength, filterReasoning]);

  // Handle model selection
  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setModelSearchInput('');
    setShowModelDropdown(false);
    const m = models.find((m) => m.id === modelId)
    if(m?.providers.length === 1) {
      setSelectedProvider(m?.providers[0].provider);
    }else{
      setSelectedProvider('');
    }
  };

  // Message management
  const addMessage = () => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: '',
    };
    setMessages([...messages, newMessage]);
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)));
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter((msg) => msg.id !== id));
  };

  // Parameter management
  const handleParameterChange = (
    param: keyof typeof parameters,
    type: 'default' | 'custom',
    value?: number
  ) => {
    setParameters((prev) => ({
      ...prev,
      [param]: {
        type,
        value: type === 'custom' ? value : undefined,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      modelId: selectedModelId,
      provider: selectedProvider,
      systemPrompt,
      inputPrompt,
      messages,
      parameters,
    });
    // TODO: Send to server
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p className="text-gray-600">Loading models...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.layout.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Model Selection Section */}
      <div className={styles.container.sectionBase}>
        <label className={styles.label.base}>AI Model</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className={styles.button.dropdown}
          >
            <span>{selectedModelId || 'Select a model...'}</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${showModelDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showModelDropdown && (
            <div className={styles.container.dropdown}>
              <div className="flex gap-2 border-b border-gray-200 p-2">
                <input
                  type="text"
                  placeholder="Search models..."
                  value={modelSearchInput}
                  onChange={(e) => setModelSearchInput(e.target.value)}
                  className={styles.input.search}
                  autoFocus
                />
                <div>
                  <label className={styles.label.small}>Context</label>
                  <select
                    value={minContextLength ?? ''}
                    onChange={(e) => setMinContextLength(e.target.value ? parseInt(e.target.value) : null)}
                    className={styles.input.sm}
                  >
                    <option value="">No minimum</option>
                    <option value="64000">64K+ tokens</option>
                    <option value="128000">128K+ tokens</option>
                    <option value="200000">200K+ tokens</option>
                    <option value="400000">400K+ tokens</option>
                    <option value="1000000">1M+ tokens</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setModelSortBy('name')}
                  className={modelSortBy === 'name' ? styles.button.sort : styles.button.sortInactive}
                >
                  <ArrowDownAz /> Name
                </button>
                <button
                  type="button"
                  onClick={() => setModelSortBy('price')}
                  className={modelSortBy === 'price' ? styles.button.sort : styles.button.sortInactive}
                >
                  <ArrowDown01 /> Price
                </button>
                <button
                  type="button"
                  onClick={() => setFilterReasoning(!filterReasoning)}
                  className={filterReasoning ? styles.button.sort : styles.button.sortInactive}
                >
                  Reasoning
                </button>
              </div>
              <div className={styles.container.dropdownContent}>
                {filteredModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelectModel(model.id)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 focus:outline-none focus:bg-blue-50"
                  >
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className={styles.text.mutedSmallMt}>
                      {model.id}
                       • ${model.providers.length > 0 ? (Math.min(...model.providers.map((p) => p.inputPrice))).toFixed(4) : 'N/A'}{' '}
                       / ${model.providers.length > 0 ? (Math.min(...model.providers.map((p) => p.outputPrice))).toFixed(4) : 'N/A'} per M tokens
                       • Context: {model.providers.length > 0 ? (Math.max(...model.providers.map((p) => p.contextLength)) / 1000).toFixed(0) : 'N/A'}K tokens
                       • {model.reasoning ? 'Reasoning' : 'Not Reasoning'}
                    </div>
                  </button>
                ))}
                {filteredModels.length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-center">No models found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Provider Selection Section */}
      <div className={styles.container.sectionBase}>
        <label className={styles.label.base}>Provider</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProviderDropdown(!showProviderDropdown)}
            className={styles.button.dropdown}
          >
            <span>{selectedProvider || 'Select a provider...'}</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${showModelDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showProviderDropdown && (
            <div className={styles.container.dropdown}>
              <div className={styles.container.dropdownContent}>
                {currentModel && currentModel.providers.sort((a, b) => a.inputPrice + a.outputPrice - b.inputPrice - b.outputPrice).map((p) => (
                  <button
                    key={p.provider}
                    type="button"
                    onClick={() => { setSelectedProvider(p.provider); setShowProviderDropdown(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 focus:outline-none focus:bg-blue-50"
                  >
                    <div className="font-medium text-gray-900">{p.provider}</div>
                    <div className={styles.text.mutedSmallMt}>
                       ${p.inputPrice.toFixed(4)} / ${p.outputPrice.toFixed(4)} per M tokens
                       • Context: {(p.contextLength / 1000).toFixed(0)}K tokens
                       • {currentModel.reasoning ? 'Reasoning' : 'Not Reasoning'}
                    </div>
                  </button>
                ))}
                {!currentModel || currentModel.providers.length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-center">No providers found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Provider Info Section */}
      {currentModel && currentProvider && (
        <div className={styles.container.sectionBase}>
          <div className={styles.container.infoCard}>
            <div>
              <div className="text-sm font-medium text-gray-900">Model: <a href={`https://vercel.com/ai-gateway/models/${currentModel.id.split('/')[1]}`} target="_blank" rel="noopener noreferrer">{currentModel.name}</a> • Provider: {currentProvider.provider}</div>
              {currentModel.description && (
                <div className="text-xs text-gray-600 mt-1">{currentModel.description}</div>
              )}
              <div>${currentProvider.inputPrice.toFixed(4)} / ${currentProvider.outputPrice.toFixed(4)} per M tokens
                   • Context: {(currentProvider.contextLength / 1000).toFixed(0)}K tokens</div>
            </div>
          </div>
        </div>
      )}

      {/* System Prompt Section */}
      <div className={styles.container.sectionBase}>
        <label htmlFor="system-prompt" className={styles.label.base}>
          System Prompt
        </label>
        <textarea
          id="system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Define the behavior and context for the AI..."
          className={`${styles.input.base} min-h-24 font-mono text-sm`}
        />
      </div>

      {/* Input Prompt Section */}
      <div className={styles.container.sectionBase}>
        <label htmlFor="input-prompt" className={styles.label.base}>
          Input Prompt
        </label>
        <textarea
          id="input-prompt"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Enter your question or request..."
          className={`${styles.input.base} min-h-24 font-mono text-sm`}
        />
      </div>

      {/* Conversation History Section */}
      <div className={styles.container.section}>
        <label className={styles.label.base}>Conversation History</label>

        <div className={styles.container.section}>
          {messages.length === 0 ? (
            <p className={styles.text.italic}>No messages added yet</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={styles.container.messageCard}>
                <div className={styles.layout.flexGap}>
                  <select
                    value={message.role}
                    onChange={(e) =>
                      updateMessage(message.id, {
                        role: e.target.value as 'system' | 'assistant' | 'user',
                      })
                    }
                    className={styles.input.sm}
                  >
                    <option value="user">User</option>
                    <option value="assistant">Assistant</option>
                    <option value="system">System</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteMessage(message.id)}
                    className={styles.button.tertiary}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {message.role === 'assistant' && currentModel?.reasoning && (
                  <div>
                    <label className={styles.label.smallMuted}>
                      Reasoning (optional)
                    </label>
                    <textarea
                      value={message.reasoning || ''}
                      onChange={(e) => updateMessage(message.id, { reasoning: e.target.value })}
                      placeholder="Internal reasoning (optional)..."
                      className={`${styles.input.textarea} min-h-16`}
                    />
                  </div>
                )}

                <div>
                  <label className={styles.label.smallMuted}>Text</label>
                  <textarea
                    value={message.text}
                    onChange={(e) => updateMessage(message.id, { text: e.target.value })}
                    placeholder="Message content..."
                    className={`${styles.input.textarea} min-h-20`}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.layout.flexEnd}>
          <button
            type="button"
            onClick={addMessage}
            className={styles.button.primarySmall}
          >
            <Plus size={16} />
            Add Message
          </button>
        </div>
      </div>

      {/* Parameters Section */}
      <div className="space-y-4">
        <h3 className={styles.label.base}>Model Parameters</h3>
        <div className={styles.layout.parameterGrid}>
          {[
            { key: 'maxOutputTokens', label: 'Max Output Tokens', step: 1 },
            { key: 'temperature', label: 'Temperature', step: 0.01, min: 0, max: 2 },
            { key: 'topP', label: 'Top P', step: 0.01, min: 0, max: 1 },
            { key: 'topK', label: 'Top K', step: 1 },
            { key: 'presencePenalty', label: 'Presence Penalty', step: 0.01, min: -2, max: 2 },
            { key: 'frequencyPenalty', label: 'Frequency Penalty', step: 0.01, min: -2, max: 2 },
          ].map((param) => {
            const paramKey = param.key as keyof typeof parameters;
            const paramValue = parameters[paramKey];

            return (
              <div key={param.key} className="space-y-2">
                <label className={styles.label.small}>
                  {param.label}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleParameterChange(paramKey, 'default')}
                    className={`${paramValue.type === 'default' ? styles.button.secondary : styles.button.secondaryInactive}`}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => handleParameterChange(paramKey, 'custom')}
                    className={`${paramValue.type === 'custom' ? styles.button.secondary : styles.button.secondaryInactive}`}
                  >
                    Custom
                  </button>
                </div>
                {paramValue.type === 'custom' && (
                  <input
                    type="number"
                    step={param.step}
                    min={param.min}
                    max={param.max}
                    value={paramValue.value || ''}
                    onChange={(e) =>
                      handleParameterChange(
                        paramKey,
                        'custom',
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="Enter value..."
                    className={styles.input.sm}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`${styles.button.primary} w-full py-3 font-semibold`}
      >
        Send Request
      </button>
    </form>
  );
}
