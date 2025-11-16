import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router'; // <-- FIX: Import from 'react-router-dom'
// import { notificationService } from '../../services/notificationService'; // <-- FIX: Removed unused import

// Helper to format time ago
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
};

const NotificationBell = () => {
  // All data comes from AuthContext, which *uses* the notificationService
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkAllRead = (e) => {
    e.preventDefault();
    e.stopPropagation();
    markAllNotificationsRead();
  };

  const handleNotificationClick = (notificationId) => {
    markNotificationRead(notificationId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
        title="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg z-30">
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  You're all caught up!
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif._id}
                    to={notif.link}
                    onClick={() => handleNotificationClick(notif._id)}
                    className="flex items-start p-3 hover:bg-gray-50 border-b border-gray-100"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0 mr-3">
                      <span className="text-primary-600 text-sm font-bold">
                        {notif.createdBy?.name?.charAt(0).toUpperCase() || 'i'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{notif.message}</p>
                      <span className="text-xs text-gray-500">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2.5 h-2.5 bg-primary-600 rounded-full shrink-0 ml-2 mt-1.5"></div>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;