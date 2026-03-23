'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Trash2, Plus } from 'lucide-react';
import { gateway } from '@ai-sdk/gateway';

interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  inputPrice: string;
  outputPrice: string;
}

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
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelSearchInput, setModelSearchInput] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

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

  // Fetch models from AI SDK
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const { models } = await gateway.getAvailableModels();
        
        // Filter only language models and map to our ModelInfo format
        const languageModels = models
          .filter((model) => model.modelType === 'language')
          .map((model) => ({
            id: model.id,
            name: model.name,
            description: model.description || undefined,
            inputPrice: model.pricing?.input || '0',
            outputPrice: model.pricing?.output || '0',
          }));

        setModels(languageModels);
      } catch (err) {
        setError('Failed to fetch models. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Get selected model object
  const currentModel = models.find((m) => m.id === selectedModel);

  // Find cheapest model (since each model only has one provider)
  const getCheapestModel = () => {
    if (models.length === 0) return null;
    return models.reduce((cheapest, current) => {
      const currentTotal = parseFloat(current.inputPrice) + parseFloat(current.outputPrice);
      const cheapestTotal =
        parseFloat(cheapest.inputPrice) + parseFloat(cheapest.outputPrice);
      return currentTotal < cheapestTotal ? current : cheapest;
    });
  };

  // Filter models based on search
  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(modelSearchInput.toLowerCase())
  );

  // Handle model selection
  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    setModelSearchInput('');
    setShowModelDropdown(false);
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
      model: selectedModel,
      systemPrompt,
      inputPrompt,
      messages,
      parameters,
    });
    // TODO: Send to server
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading models...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      {/* Model Selection Section */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">AI Model</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg bg-white flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>{selectedModel || 'Select a model...'}</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${showModelDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showModelDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search models..."
                  value={modelSearchInput}
                  onChange={(e) => setModelSearchInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelectModel(model.id)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 focus:outline-none focus:bg-blue-50"
                  >
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {model.id} • ${model.inputPrice}/${model.outputPrice}
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

      {/* Provider Info Section */}
      {currentModel && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Model Details</label>
          <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 space-y-2">
            <div>
              <div className="text-sm font-medium text-gray-900">{currentModel.name}</div>
              {currentModel.description && (
                <div className="text-xs text-gray-600 mt-1">{currentModel.description}</div>
              )}
            </div>
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
              Pricing: ${currentModel.inputPrice} (input) / ${currentModel.outputPrice} (output) per token
            </div>
          </div>
        </div>
      )}

      {/* System Prompt Section */}
      <div className="space-y-2">
        <label htmlFor="system-prompt" className="block text-sm font-semibold text-gray-700">
          System Prompt
        </label>
        <textarea
          id="system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Define the behavior and context for the AI..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24 font-mono text-sm"
        />
      </div>

      {/* Input Prompt Section */}
      <div className="space-y-2">
        <label htmlFor="input-prompt" className="block text-sm font-semibold text-gray-700">
          Input Prompt
        </label>
        <textarea
          id="input-prompt"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Enter your question or request..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24 font-mono text-sm"
        />
      </div>

      {/* Conversation History Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">Conversation History</label>
          <button
            type="button"
            onClick={addMessage}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Message
          </button>
        </div>

        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No messages added yet</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-end gap-2">
                  <select
                    value={message.role}
                    onChange={(e) =>
                      updateMessage(message.id, {
                        role: e.target.value as 'system' | 'assistant' | 'user',
                      })
                    }
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="assistant">Assistant</option>
                    <option value="system">System</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteMessage(message.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {message.role === 'assistant' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Reasoning (optional)
                    </label>
                    <textarea
                      value={message.reasoning || ''}
                      onChange={(e) => updateMessage(message.id, { reasoning: e.target.value })}
                      placeholder="Internal reasoning (optional)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono min-h-16"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Text</label>
                  <textarea
                    value={message.text}
                    onChange={(e) => updateMessage(message.id, { text: e.target.value })}
                    placeholder="Message content..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono min-h-20"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Parameters Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Model Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <label className="block text-xs font-semibold text-gray-700">
                  {param.label}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleParameterChange(paramKey, 'default')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      paramValue.type === 'default'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => handleParameterChange(paramKey, 'custom')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      paramValue.type === 'custom'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Send Request
      </button>
    </form>
  );
}
