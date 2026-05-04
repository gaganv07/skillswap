import React, { useEffect, useRef, useState } from 'react';
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
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      setOtherUser(null);
      setLoading(false);
      return;
    }
    loadChat();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async () => {
    try {
      setLoading(true);
      setError(null);
      const [messagesData, userData] = await Promise.all([
        chatAPI.getMessages(userId),
        userAPI.getUserProfile(userId),
      ]);
      setMessages(messagesData.messages || []);
      setOtherUser(userData.user);
    } catch (err) {
      setError(err.message || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messageData = await chatAPI.sendMessage({
        receiverId: userId,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, messageData.message]);
      setNewMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <section className="card p-8">
        <div className="flex items-center justify-center gap-3 py-12 text-slate-600">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <span>Loading chat...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      </section>
    );
  }

  if (!userId) {
    return (
      <div className="space-y-6">
        <section className="card overflow-hidden">
          <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_52%,#0f766e_100%)] px-6 py-8 text-white sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/65">Messages</p>
            <h1 className="mt-2 text-3xl font-semibold">Choose a conversation</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
              Open chat from an accepted request, a match card, or a profile connection button to start messaging.
            </p>
          </div>
        </section>

        <section className="card px-6 py-12 text-center sm:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 10h10M7 14h6m7-2c0 4.418-3.582 8-8 8a8.96 8.96 0 0 1-3.59-.744L3 20l.744-5.41A8.96 8.96 0 0 1 3 11c0-4.418 3.582-8 8-8s8 3.582 8 8Z" />
            </svg>
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">No chat selected yet</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This page is ready for conversations. Start from an accepted request or a match to open a dedicated thread.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_52%,#0f766e_100%)] px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              {otherUser?.profileImage ? (
                <img
                  src={otherUser.profileImage}
                  alt={otherUser.name}
                  className="h-16 w-16 rounded-2xl border border-white/20 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-semibold text-white">
                  {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/65">Conversation</p>
                <h1 className="mt-1 text-3xl font-semibold">{otherUser?.name || 'Chat'}</h1>
                <p className="mt-2 text-sm text-white/75">{otherUser?.email || 'No email available'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/75 backdrop-blur">
              Keep the conversation focused and actionable.
            </div>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex h-[68vh] min-h-[540px] flex-col">
          <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-5 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md rounded-[1.75rem] border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 10h10M7 14h6m7-2c0 4.418-3.582 8-8 8a8.96 8.96 0 0 1-3.59-.744L3 20l.744-5.41A8.96 8.96 0 0 1 3 11c0-4.418 3.582-8 8-8s8 3.582 8 8Z" />
                    </svg>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-slate-900">Start the conversation</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Introduce yourself, suggest a learning plan, or ask how you can help.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isCurrentUser = message.sender._id === currentUser?._id;

                  return (
                    <div key={message._id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-[1.4rem] px-4 py-3 shadow-sm sm:max-w-[70%] ${
                          isCurrentUser
                            ? 'bg-slate-900 text-white'
                            : 'border border-slate-200 bg-white text-slate-900'
                        }`}
                      >
                        <p className="text-sm leading-6">{message.content || message.message}</p>
                        <p className={`mt-2 text-xs ${isCurrentUser ? 'text-slate-300' : 'text-slate-500'}`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a thoughtful message..."
                className="form-input flex-1"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="inline-flex min-w-[128px] items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ChatPage;
