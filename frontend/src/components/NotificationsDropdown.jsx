import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';

function NotificationsDropdown() {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds (fallback)
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket && isConnected) {
      const handleNotification = (notification) => {
        console.log('Real-time notification received:', notification);

        // Add new notification to the list
        const newNotification = {
          _id: Date.now().toString(), // Temporary ID
          type: notification.type,
          message: notification.message,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedUserId: notification.relatedUserId,
          relatedRequestId: notification.relatedRequestId,
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('SkillSwap Connect', {
            body: notification.message,
            icon: '/favicon.ico',
          });
        } else if (Notification.permission === 'default') {
          // Request permission
          Notification.requestPermission();
        }
      };

      socket.on('notification', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket, isConnected]);

  const loadNotifications = async () => {
    try {
      const [notificationsData, unreadData] = await Promise.all([
        notificationAPI.getNotifications(),
        notificationAPI.getUnreadCount(),
      ]);
      setNotifications(notificationsData.notifications);
      setUnreadCount(unreadData.count);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift hover-scale text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      >
        <span className="text-base">🔔</span>
        <span className="hidden sm:inline">Notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      !notification.isRead ? 'bg-blue-500' : 'bg-slate-300'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">{notification.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-slate-200">
              <Link
                to="/notifications"
                className="text-sm text-slate-600 hover:text-slate-900"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default NotificationsDropdown;