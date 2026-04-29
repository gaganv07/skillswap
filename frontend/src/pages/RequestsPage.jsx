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
      const [incoming, sent] = await Promise.all([
        requestAPI.getIncomingRequests(),
        requestAPI.getSentRequests(),
      ]);
      setIncomingRequests(incoming.requests);
      setSentRequests(sent.requests);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));
      await requestAPI.acceptRequest(requestId);
      // Update local state
      setIncomingRequests(prev =>
        prev.map(req =>
          req._id === requestId ? { ...req, status: 'accepted' } : req
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to accept request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));
      await requestAPI.rejectRequest(requestId);
      // Remove from local state
      setIncomingRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="ml-2">Loading requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Incoming Requests */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Incoming Requests ({incomingRequests.length})
        </h2>

        {incomingRequests.length === 0 ? (
          <p className="text-slate-600">No incoming requests</p>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {request.sender?.profileImage ? (
                    <img
                      src={request.sender.profileImage}
                      alt={request.sender.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-sm font-semibold text-slate-500">
                        {request.sender?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{request.sender?.name}</p>
                    <p className="text-sm text-slate-600">{request.sender?.email}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {request.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleAcceptRequest(request._id)}
                        disabled={processingRequests.has(request._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {processingRequests.has(request._id) ? 'Processing...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        disabled={processingRequests.has(request._id)}
                        className="inline-flex items-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                      >
                        {processingRequests.has(request._id) ? 'Processing...' : 'Reject'}
                      </button>
                    </>
                  ) : (
                    <div className="flex space-x-2">
                      <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                        request.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status === 'accepted' ? 'Accepted' : 'Rejected'}
                      </span>
                      {request.status === 'accepted' && (
                        <Link
                          to={`/chat/${request.sender._id}`}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800"
                        >
                          Chat
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Requests */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Sent Requests ({sentRequests.length})
        </h2>

        {sentRequests.length === 0 ? (
          <p className="text-slate-600">No sent requests</p>
        ) : (
          <div className="space-y-4">
            {sentRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {request.receiver?.profileImage ? (
                    <img
                      src={request.receiver.profileImage}
                      alt={request.receiver.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-sm font-semibold text-slate-500">
                        {request.receiver?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{request.receiver?.name}</p>
                    <p className="text-sm text-slate-600">{request.receiver?.email}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                    request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status === 'pending' ? 'Pending' : request.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </span>
                  {request.status === 'accepted' && (
                    <Link
                      to={`/chat/${request.receiver._id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800"
                    >
                      Chat
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestsPage;