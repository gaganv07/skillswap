import React, { useEffect, useState } from 'react';
import AppToast from '../components/AppToast';
import { requestAPI, userAPI } from '../services/api';

function ExploreUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingRequests, setSendingRequests] = useState(new Set());
  const [userRequests, setUserRequests] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadUsersAndRequests();
  }, []);

  const loadUsersAndRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const currentUserId = currentUser?._id;

      const userData = await userAPI.getAllUsers();
      const sentRequests = await requestAPI.getSentRequests();
      const incomingRequests = await requestAPI.getIncomingRequests();

      const requestMap = {};

      (sentRequests?.requests || []).forEach((request) => {
        if (request?.receiver?._id) {
          requestMap[request.receiver._id] = {
            status: request.status,
            id: request._id,
          };
        }
      });

      (incomingRequests?.requests || []).forEach((request) => {
        if (request?.sender?._id) {
          requestMap[request.sender._id] = {
            status: request.status,
            id: request._id,
            isIncoming: true,
          };
        }
      });

      const filteredUsers = (userData?.users || []).filter((user) => user?._id && user._id !== currentUserId);

      setUserRequests(requestMap);
      setUsers(filteredUsers);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (user) => {
    try {
      if (!user?._id) {
        setToast({ type: 'error', message: 'Invalid user. Please refresh and try again.' });
        return;
      }

      setSendingRequests((prev) => new Set(prev).add(user._id));

      await requestAPI.sendRequest({
        receiverId: user._id,
      });

      setUserRequests((prev) => ({
        ...prev,
        [user._id]: { status: 'pending' },
      }));

      setToast({ type: 'success', message: 'Request sent successfully.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to send request.' });
    } finally {
      setSendingRequests((prev) => {
        const next = new Set(prev);
        next.delete(user._id);
        return next;
      });
    }
  };

  const getRequestButtonProps = (user) => {
    const request = userRequests[user._id];
    const isSending = sendingRequests.has(user._id);

    if (isSending) {
      return {
        text: 'Sending...',
        disabled: true,
        className: 'bg-slate-300 text-slate-600 cursor-not-allowed',
      };
    }

    if (!request) {
      return {
        text: 'Send Request',
        disabled: false,
        onClick: () => handleSendRequest(user),
        className: 'bg-slate-900 text-white hover:bg-slate-800',
      };
    }

    if (request.isIncoming && request.status === 'pending') {
      return {
        text: 'Request Received',
        disabled: true,
        className: 'bg-amber-100 text-amber-800 cursor-not-allowed',
      };
    }

    switch (request.status) {
      case 'pending':
        return {
          text: 'Request Pending',
          disabled: true,
          className: 'bg-slate-200 text-slate-600 cursor-not-allowed',
        };
      case 'accepted':
        return {
          text: 'Connected',
          disabled: true,
          className: 'bg-emerald-100 text-emerald-700 cursor-not-allowed',
        };
      default:
        return {
          text: 'Send Request',
          disabled: false,
          onClick: () => handleSendRequest(user),
          className: 'bg-slate-900 text-white hover:bg-slate-800',
        };
    }
  };

  const getSkills = (user) => user.skillsOfferedSimple || user.skillsOffered || [];
  const getWantedSkills = (user) => user.skillsWantedSimple || user.skillsWanted || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="card card-hover animate-fade-in-scale">
          <div className="p-6">
            <div className="h-8 w-56 rounded-lg bg-slate-200 loading-shimmer"></div>
            <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200 loading-shimmer"></div>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="card p-5">
              <div className="h-6 w-36 rounded bg-slate-200 loading-shimmer"></div>
              <div className="mt-3 h-4 w-48 rounded bg-slate-200 loading-shimmer"></div>
              <div className="mt-5 flex gap-2">
                <div className="h-6 w-20 rounded-full bg-slate-200 loading-shimmer"></div>
                <div className="h-6 w-24 rounded-full bg-slate-200 loading-shimmer"></div>
              </div>
              <div className="mt-6 h-10 w-full rounded-xl bg-slate-200 loading-shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <section className="card card-hover">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-slate-900">Explore Users</h1>
            <p className="mt-2 text-slate-600">Find people who can teach what you want to learn.</p>
          </div>
        </section>

        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AppToast toast={toast} onClose={() => setToast(null)} />

      <section className="card card-hover animate-fade-in-scale overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-700 px-6 py-8 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">Discover</p>
              <h1 className="mt-2 text-3xl font-semibold">Explore Skill Partners</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/80">
                Browse members, check what they offer, and send a request to start learning together.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Available Profiles</p>
              <p className="mt-1 text-2xl font-semibold">{users.length}</p>
            </div>
          </div>
        </div>
      </section>

      {users.length === 0 ? (
        <section className="card card-hover animate-fade-in-up">
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              🔎
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">No users to explore yet</h2>
            <p className="mt-2 text-slate-600">
              Once more members join or complete their profiles, they will appear here.
            </p>
          </div>
        </section>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user, index) => {
            const btn = getRequestButtonProps(user);
            const offeredSkills = getSkills(user).filter(Boolean).slice(0, 3);
            const wantedSkills = getWantedSkills(user).filter(Boolean).slice(0, 3);

            return (
              <article
                key={user._id}
                className={`card card-hover animate-fade-in-up animate-delay-${((index % 5) + 1) * 100} overflow-hidden`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
                          {(user.name || 'U').trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold text-slate-900">{user.name || 'Unnamed User'}</h2>
                          <p className="truncate text-sm text-slate-500">{user.email || 'No email available'}</p>
                        </div>
                      </div>
                    </div>

                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                      Explore
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                    {user.bio || 'This member is ready to connect, teach, and learn through skill swaps.'}
                  </p>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Offers</p>
                    <div className="mt-2 flex min-h-10 flex-wrap gap-2">
                      {offeredSkills.length > 0 ? (
                        offeredSkills.map((skill) => (
                          <span
                            key={`${user._id}-offer-${skill}`}
                            className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800"
                          >
                            {typeof skill === 'string' ? skill : skill?.name || 'Skill'}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                          No offered skills listed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Wants To Learn</p>
                    <div className="mt-2 flex min-h-10 flex-wrap gap-2">
                      {wantedSkills.length > 0 ? (
                        wantedSkills.map((skill) => (
                          <span
                            key={`${user._id}-want-${skill}`}
                            className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                          >
                            {typeof skill === 'string' ? skill : skill?.name || 'Skill'}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                          No learning goals listed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="text-sm text-slate-500">
                      Ready to connect
                    </div>

                    <button
                      disabled={btn.disabled}
                      onClick={btn.onClick}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${btn.className}`}
                    >
                      {btn.text}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExploreUsersPage;
