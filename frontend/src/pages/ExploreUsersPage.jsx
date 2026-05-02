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

      const userData = await userAPI.getAllUsers();
      const sentRequests = await requestAPI.getSentRequests();
      const incomingRequests = await requestAPI.getIncomingRequests();

      const requestMap = {};

      sentRequests.requests.forEach(request => {
        requestMap[request.receiver._id] = {
          status: request.status,
          id: request._id
        };
      });

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

  // ✅ FIXED FUNCTION
  const handleSendRequest = async (user) => {
    try {
      if (!user || !user._id) {
        alert("Invalid user");
        return;
      }

      setSendingRequests(prev => new Set(prev).add(user._id));

      await requestAPI.sendRequest({
        receiverId: user._id
      });

      setUserRequests(prev => ({
        ...prev,
        [user._id]: { status: 'pending' }
      }));

      alert("Request sent");

    } catch (err) {
      alert(err.message);
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(user._id);
        return newSet;
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
      };
    }

    if (!request) {
      return {
        text: 'Send Request',
        disabled: false,
        onClick: () => handleSendRequest(user),
      };
    }

    switch (request.status) {
      case 'pending':
        return { text: 'Request Pending', disabled: true };
      case 'accepted':
        return { text: 'Connected', disabled: true };
      default:
        return {
          text: 'Send Request',
          disabled: false,
          onClick: () => handleSendRequest(user),
        };
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Explore Users</h1>

      {users.map((user) => {
        const btn = getRequestButtonProps(user);

        return (
          <div key={user._id}>
            <h3>{user.name}</h3>
            <p>{user.email}</p>

            <button
              disabled={btn.disabled}
              onClick={btn.onClick}
            >
              {btn.text}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ExploreUsersPage;