import React, { useState, useEffect } from 'react';
// Notifications will be handled by real-time backend later
// import { notificationApi } from '../../services/realtimeApi';
import '../../styles/components/NotificationCenter.css';

const NotificationCenter = ({ userId, userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getUserNotifications(userId);
      setNotifications(data);
      // Count unread notifications
      const unread = data.filter(notification => !notification.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true } 
          : notification
      ));
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="notification-center">
      <button 
        className="notification-button" 
        onClick={toggleNotifications} 
        aria-label="Toggle notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button onClick={toggleNotifications} className="close-button">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="notification-content">
            {loading && <div className="notification-loading">Loading notifications...</div>}
            
            {error && <div className="notification-error">{error}</div>}
            
            {!loading && !error && notifications.length === 0 && (
              <div className="no-notifications">No notifications</div>
            )}

            {!loading && !error && notifications.length > 0 && (
              <ul className="notification-list">
                {notifications.map(notification => (
                  <li 
                    key={notification.id} 
                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className={`notification-type ${notification.type || 'default'}`}>
                      <i className="fas fa-calendar-check notification-icon"></i>
                    </div>
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <span className="notification-time">{formatDate(notification.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 