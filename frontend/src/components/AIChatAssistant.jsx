import React, { useState } from 'react';
import api from '../services/api';

/**
 * AI Chat Assistant Component
 * Suggests replies and improves message tone
 */
const AIChatAssistant = ({ onSelectSuggestion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTone, setSelectedTone] = useState('friendly');

  const tones = ['friendly', 'formal', 'professional', 'casual'];

  const handleGenerateSuggestions = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/chat-assistant', {
        message: userMessage,
        tone: selectedTone,
      });

      if (response.data.data) {
        setSuggestions(response.data.data.suggestions || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onSelectSuggestion(suggestion);
    setIsOpen(false);
    setUserMessage('');
    setSuggestions([]);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        title="AI Assistant (✨)"
      >
        ✨ AI
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 z-50">
          {/* Close Button */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">AI Suggestions</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>

          {/* Tone Selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone:
            </label>
            <div className="flex gap-2 flex-wrap">
              {tones.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTone === tone
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleGenerateSuggestions} className="mb-3">
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
              rows="3"
            />
            <button
              type="submit"
              disabled={loading || !userMessage.trim()}
              className="w-full mt-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm font-medium"
            >
              {loading ? 'Generating...' : 'Get Suggestions'}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Suggestions Display */}
          {suggestions.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Suggestions:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click a suggestion to insert it into your message
              </p>
            </div>
          )}

          {/* No Suggestions */}
          {!loading && suggestions.length === 0 && userMessage.trim() && (
            <div className="text-center text-sm text-gray-500 py-3">
              No suggestions generated. Try a different message.
            </div>
          )}

          {/* Help Text */}
          {!userMessage.trim() && (
            <div className="text-xs text-gray-500 text-center py-3">
              Type a message to get AI suggestions
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIChatAssistant;