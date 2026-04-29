import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { chatAPI, userAPI } from '../services/api';

function ChatPage() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChat();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    try {
      setLoading(true);
      const [messagesData, userData] = await Promise.all([
        chatAPI.getMessages(userId),
        userAPI.getUserProfile(userId),
      ]);
      setMessages(messagesData.messages);
      setOtherUser(userData.user);
    } catch (err) {
      setError(err.message || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messageData = await chatAPI.sendMessage({
        receiverId: userId,
        message: newMessage.trim(),
      });

      setMessages(prev => [...prev, messageData.message]);
      setNewMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="ml-2">Loading chat...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 flex items-center space-x-3">
        {otherUser?.profileImage ? (
          <img
            src={otherUser.profileImage}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="text-sm font-semibold text-slate-500">
              {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}
        <div>
          <h2 className="font-semibold text-slate-900">{otherUser?.name}</h2>
          <p className="text-sm text-slate-600">{otherUser?.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === JSON.parse(localStorage.getItem('user'))._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender._id === JSON.parse(localStorage.getItem('user'))._id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.sender._id === JSON.parse(localStorage.getItem('user'))._id
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;
