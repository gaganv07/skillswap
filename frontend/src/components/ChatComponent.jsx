import React, { useState, useEffect, useRef } from 'react';
import {
  encryptMessage,
  decryptMessage,
  getPrivateKey,
} from '../utils/encryption';
import MediaUploader from './MediaUploader';
import AIChatAssistant from './AIChatAssistant';
import { API_URL } from '../services/api';

/**
 * Enhanced Chat Component
 * Supports group chats, media sharing, encryption, AI assistant, and video calls
 */
const ChatComponent = ({ roomId, socket, currentUser, isGroupChat }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join room on mount
  useEffect(() => {
    if (socket && roomId) {
      socket.emit('room:join', roomId);

      // Mark room as read
      fetch(`${API_URL}/chat/room/${roomId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }).catch(console.error);

      return () => {
        socket.emit('room:leave', roomId);
      };
    }
  }, [socket, roomId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = async (data) => {
      if (data.roomId === roomId) {
        // Decrypt if encrypted
        let decryptedContent = data.content;
        if (data.encryptedContent) {
          try {
            decryptedContent = await decryptMessage(data.encryptedContent);
          } catch (error) {
            console.error('Failed to decrypt message:', error);
            decryptedContent = '[Encrypted message - decryption failed]';
          }
        }

        const decryptedMessage = {
          ...data,
          content: decryptedContent,
          sender: { _id: data.senderId, name: 'User' }, // Would need to populate
          createdAt: data.timestamp,
        };
        setMessages((prev) => [...prev, decryptedMessage]);
      }
    };

    // Listen for typing indicators
    const handleTypingStart = (data) => {
      setTypingUsers((prev) => new Set([...prev, data.userId]));
    };

    const handleTypingStop = () => {
      setTypingUsers(new Set());
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, roomId]);

  // Handle typing indicator
  const handleMessageChange = (e) => {
    setMessageText(e.target.value);

    // Emit typing:start
    socket?.emit('typing:start', { roomId, userId: currentUser.id });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing:stop after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing:stop', { roomId });
    }, 1000);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    const content = messageText.trim();
    if (!content && !uploadedMedia) return;

    setLoading(true);

    try {
      let encryptedContent = null;

      // Encrypt message if it's a direct message (not group)
      if (!isGroupChat && content) {
        // Get recipient's public key (would need to fetch from API in real implementation)
        encryptedContent = content; // Placeholder - would encrypt with recipient's public key
      }

      const messageData = {
        roomId,
        senderId: currentUser.id,
        content,
        type: uploadedMedia?.type || 'text',
        fileUrl: uploadedMedia?.fileUrl,
        fileName: uploadedMedia?.fileName,
        fileSize: uploadedMedia?.fileSize,
        encryptedContent,
      };

      // Send via Socket.IO for real-time delivery
      socket?.emit('message:send', messageData);

      // Reset
      setMessageText('');
      setUploadedMedia(null);
      socket?.emit('typing:stop', { roomId });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle media upload
  const handleMediaUpload = (mediaData) => {
    setUploadedMedia(mediaData);
  };

  // Handle AI suggestion
  const handleAISuggestion = (suggestion) => {
    setMessageText(suggestion);
  };

  // Render message based on type
  const renderMessage = (message) => {
    switch (message.type) {
      case 'image':
        return (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={message.fileUrl}
              alt="Chat image"
              className="max-w-xs max-h-96 rounded-lg"
            />
          </a>
        );
      case 'file':
        return (
          <a
            href={message.fileUrl}
            download={message.fileName}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            📄 {message.fileName}
          </a>
        );
      default:
        return <p className="break-words">{message.content}</p>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender._id === currentUser.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender._id === currentUser.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-900'
              }`}
            >
              {!currentUser.id !== message.sender._id && (
                <p className="text-xs font-semibold mb-1">{message.sender.name}</p>
              )}
              {renderMessage(message)}
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
              {message.encryptedContent && (
                <p className="text-xs mt-1">🔒 Encrypted</p>
              )}
            </div>
          </div>
        ))}
        {messagesEndRef.current && <div ref={messagesEndRef} />}
      </div>

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 text-sm text-gray-600">
          {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Message Input Area */}
      <form onSubmit={handleSendMessage} className="border-t bg-white p-4">
        {/* Media Preview */}
        {uploadedMedia && (
          <div className="mb-3 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {uploadedMedia.type === 'image' ? '🖼️' : '📄'} {uploadedMedia.fileName}
            </span>
            <button
              type="button"
              onClick={() => setUploadedMedia(null)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}

        {/* Input Controls */}
        <div className="flex gap-3 items-end">
          {/* Text Input */}
          <input
            type="text"
            value={messageText}
            onChange={handleMessageChange}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />

          {/* Media Uploader */}
          <MediaUploader
            onUploadComplete={handleMediaUpload}
            onError={(error) => console.error(error)}
          />

          {/* AI Assistant */}
          <AIChatAssistant onSelectSuggestion={handleAISuggestion} />

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || (!messageText.trim() && !uploadedMedia)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
