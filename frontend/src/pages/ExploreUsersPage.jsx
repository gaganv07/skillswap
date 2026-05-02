import React, { useEffect, useState } from 'react';
import { userAPI, requestAPI } from '../services/api';

function ExploreUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingRequests, setSendingRequests] = useState(new Set());
  const [userRequests, setUserRequests] = useState({});

  useEffect(() => {
    loadUsersAndRequests();
  }, []);

  const loadUsersAndRequests = async () => {
    try {
      setLoading(true);

      // Load users
      const userData = await userAPI.getAllUsers();

      // Load sent requests to know status
      const sentRequests = await requestAPI.getSentRequests();

      // Create a map of user ID to request status
      const requestMap = {};
      sentRequests.requests.forEach(request => {
        requestMap[request.receiver._id] = {
          status: request.status,
          id: request._id
        };
      });

      // Load incoming requests to check for reverse requests
      const incomingRequests = await requestAPI.getIncomingRequests();
      incomingRequests.requests.forEach(request => {
        requestMap[request.sender._id] = {
          status: request.status,
          id: request._id,
          isIncoming: true
        };
      });

      setUserRequests(requestMap);
      setUsers(userData.users);

    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      setSendingRequests(prev => new Set(prev).add(userId));
      await requestAPI.sendRequest({ receiverId: userId });

      // Update the request status in local state
      setUserRequests(prev => ({
        ...prev,
        [userId]: { status: 'pending', id: 'temp' }
      }));

    } catch (err) {
      console.error('Send request error:', err);

      // Handle specific error messages
      if (err.message?.includes('already exists') || err.message?.includes('already have a pending request')) {
        setUserRequests(prev => ({
          ...prev,
          [userId]: { status: 'pending', id: 'existing' }
        }));
      } else if (err.message?.includes('already connected')) {
        setUserRequests(prev => ({
          ...prev,
          [userId]: { status: 'accepted', id: 'existing' }
        }));
      } else {
        setError(err.message || 'Failed to send request');
      }
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getRequestButtonProps = (userId) => {
    const request = userRequests[userId];
    const isSending = sendingRequests.has(userId);

    if (isSending) {
      return {
        text: 'Sending...',
        disabled: true,
        className: 'w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 opacity-50 cursor-not-allowed'
      };
    }

    if (!request) {
      return {
        text: 'Send Request',
        disabled: false,
        onClick: () => handleSendRequest(userId),
        className: 'w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800'
      };
    }

    switch (request.status) {
      case 'pending':
        return {
          text: request.isIncoming ? 'Respond to Request' : 'Request Pending',
          disabled: true,
          className: 'w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-slate-700 bg-slate-100 cursor-not-allowed'
        };
      case 'accepted':
        return {
          text: 'Connected',
          disabled: true,
          className: 'w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 cursor-not-allowed'
        };
      case 'rejected':
        return {
          text: 'Send Request',
          disabled: false,
          onClick: () => handleSendRequest(userId),
          className: 'w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800'
        };
      default:
        return {
          text: 'Send Request',
          disabled: false,
          onClick: () => handleSendRequest(userId),
          className: 'w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800'
        };
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="ml-2">Loading users...</span>
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
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Explore Users</h1>
        <p className="text-slate-600">Discover people with complementary skills</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div key={user._id} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-xl font-semibold text-slate-500">
                      {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 truncate">
                  {user.name}
                </h3>
                <p className="text-sm text-slate-600 mb-2">{user.email}</p>

                {user.bio && (
                  <p className="text-sm text-slate-700 mb-3 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                {user.teachSkills && user.teachSkills.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Can Teach
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.teachSkills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {user.teachSkills.length > 3 && (
                        <span className="text-xs text-slate-500">
                          +{user.teachSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {user.learnSkills && user.learnSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Wants to Learn
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.learnSkills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {user.learnSkills.length > 3 && (
                        <span className="text-xs text-slate-500">
                          +{user.learnSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  {...getRequestButtonProps(user._id)}
                >
                  {getRequestButtonProps(user._id).text === 'Sending...' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  )}
                  {getRequestButtonProps(user._id).text !== 'Sending...' && getRequestButtonProps(user._id).text}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm text-center">
          <p className="text-slate-600">No users found. Check back later!</p>
        </div>
      )}
    </div>
  );
}

export default ExploreUsersPage;
