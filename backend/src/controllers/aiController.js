const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');

// Mock AI suggestions - replace with actual OpenAI integration
const generateChatSuggestions = async (message, tone = 'friendly') => {
  // This is a mock implementation
  // In production, integrate with OpenAI API

  const suggestions = [];

  // Simple rule-based suggestions based on message content
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    suggestions.push('Hello! How are you doing today?');
    suggestions.push('Hi there! Nice to meet you!');
    suggestions.push('Hey! What brings you here today?');
  } else if (message.toLowerCase().includes('skill') || message.toLowerCase().includes('teach')) {
    suggestions.push('I\'d love to learn that skill from you!');
    suggestions.push('That sounds interesting! Can you tell me more about it?');
    suggestions.push('I have some experience with that. Would you like to exchange skills?');
  } else if (message.toLowerCase().includes('project') || message.toLowerCase().includes('work')) {
    suggestions.push('That sounds like a great project! Can I help with anything?');
    suggestions.push('I\'ve worked on similar projects. What challenges are you facing?');
    suggestions.push('I\'d be interested in collaborating on that!');
  } else {
    // Generic suggestions
    suggestions.push('That sounds interesting! Tell me more.');
    suggestions.push('I\'d love to hear more about that.');
    suggestions.push('How did you get started with that?');
  }

  // Apply tone modifications
  if (tone === 'formal') {
    suggestions = suggestions.map(s => s.replace(/Hey|Hi|Hello/g, 'Hello').replace(/!/g, '.'));
  } else if (tone === 'professional') {
    suggestions = suggestions.map(s => s.replace(/!/g, '.').replace(/love to/g, 'would like to'));
  }

  return suggestions;
};

// @desc      Generate AI chat suggestions
// @route     POST /api/ai/chat-assistant
// @access    Private
exports.generateChatSuggestions = asyncHandler(async (req, res) => {
  const { message, tone = 'friendly' } = req.body;

  if (!message || message.trim().length === 0) {
    throw new AppError('Message is required', 400);
  }

  const suggestions = await generateChatSuggestions(message, tone);

  return successResponse(res, {
    data: {
      suggestions,
      tone,
    },
  });
});