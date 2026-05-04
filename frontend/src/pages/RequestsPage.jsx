import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestAPI } from '../services/api';

function RequestsPage() {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequests, setProcessingRequests] = useState(new Set());

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const [incoming, sent] = await Promise.all([
        requestAPI.getIncomingRequests(),
        requestAPI.getSentRequests(),
      ]);
      setIncomingRequests(incoming.requests || []);
      setSentRequests(sent.requests || []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      setProcessingRequests((prev) => new Set(prev).add(requestId));
      await requestAPI.acceptRequest(requestId);
      setIncomingRequests((prev) => prev.map((req) => (req._id === requestId ? { ...req, status: 'accepted' } : req)));
    } catch (err) {
      setError(err.message || 'Failed to accept request');
    } finally {
      setProcessingRequests((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setProcessingRequests((prev) => new Set(prev).add(requestId));
      await requestAPI.rejectRequest(requestId);
      setIncomingRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setProcessingRequests((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const renderInitial = (person) => (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
      {person?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );

  const renderStatus = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-rose-100 text-rose-800',
    };

    return (
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const RequestCard = ({ request, person, incoming = false }) => (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {renderInitial(person)}
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{person?.name || 'Unknown user'}</h3>
            <p className="text-sm text-slate-500">{person?.email || 'No email available'}</p>
            <p className="mt-2 text-sm text-slate-600">
              {incoming ? 'This member wants to connect and start a skill exchange.' : 'Your request is waiting in their queue.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {renderStatus(request.status)}

          {incoming && request.status === 'pending' && (
            <>
              <button
                onClick={() => handleAcceptRequest(request._id)}
                disabled={processingRequests.has(request._id)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {processingRequests.has(request._id) ? 'Processing...' : 'Accept'}
              </button>
              <button
                onClick={() => handleRejectRequest(request._id)}
                disabled={processingRequests.has(request._id)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reject
              </button>
            </>
          )}

          {request.status === 'accepted' && (
            <Link
              to={`/chat/${person?._id}`}
              className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              Open chat
            </Link>
          )}
        </div>
      </div>
    </article>
  );

  if (loading) {
    return (
      <section className="card p-8">
        <div className="flex items-center justify-center gap-3 py-12 text-slate-600">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <span>Loading requests...</span>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_52%,#0f766e_100%)] px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/65">Connection Center</p>
              <h1 className="mt-2 text-3xl font-semibold">Manage Requests</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                Review incoming invites, track requests you sent, and move accepted connections into conversation.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Incoming</p>
                <p className="mt-1 text-2xl font-semibold">{incomingRequests.length}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Sent</p>
                <p className="mt-1 text-2xl font-semibold">{sentRequests.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Incoming</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">People waiting on you</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {incomingRequests.length}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((request) => (
                <RequestCard key={request._id} request={request} person={request.sender} incoming />
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-slate-50 px-5 py-10 text-center text-slate-600">
                No incoming requests right now.
              </div>
            )}
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Sent</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Requests you sent</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {sentRequests.length}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {sentRequests.length > 0 ? (
              sentRequests.map((request) => (
                <RequestCard key={request._id} request={request} person={request.receiver} />
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-slate-50 px-5 py-10 text-center text-slate-600">
                You have not sent any requests yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RequestsPage;
