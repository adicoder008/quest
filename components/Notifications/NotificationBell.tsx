// components/Notifications/NotificationBell.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, CheckCheck } from 'lucide-react';
import { 
  subscribeToNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from '@/lib/notificationService';
import { useRouter } from 'next/navigation';

interface NotificationBellProps {
  userId: string;
}

export const NotificationBell = ({ userId }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(userId, (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleNotificationClick = async (notif: any) => {
    // Mark as read
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    
    // Navigate to action URL
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
    
    setShowDropdown(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead(userId);
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    await deleteNotification(notifId);
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete all notifications?')) {
      await deleteAllNotifications(userId);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'like':
        return '❤️';
      case 'comment':
        return '💭';
      case 'reply':
        return '↩️';
      case 'follow':
        return '👤';
      case 'mention':
        return '@';
      case 'quest_invite':
        return '🎯';
      case 'group_add':
        return '👥';
      case 'event_reminder':
        return '📅';
      default:
        return '🔔';
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell size={20} />
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#EA6100] hover:text-[#f5c094] transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  title="Clear all"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Bell size={32} className="text-gray-600" />
                </div>
                <h4 className="text-white font-medium mb-2">No notifications</h4>
                <p className="text-gray-400 text-sm">
                  When you get notifications, they'll show up here
                </p>
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-800 transition-colors border-b border-gray-800 text-left ${
                    !notif.read ? 'bg-gray-800/50' : ''
                  }`}
                >
                  {/* Sender Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={notif.senderPhoto || '/default-avatar.png'}
                      alt={notif.senderName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-xs">
                        {getNotificationIcon(notif.type)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white mb-1 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notif.read && (
                      <div className="w-2 h-2 bg-[#EA6100] rounded-full"></div>
                    )}
                    
                    <button
                      onClick={(e) => handleDeleteNotification(e, notif.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      title="Delete"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer (if needed) */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700 text-center bg-gray-900">
              <button
                onClick={() => {
                  router.push('/notifications');
                  setShowDropdown(false);
                }}
                className="text-sm text-[#EA6100] hover:text-[#f5c094] font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =================================================================
// MOBILE NOTIFICATION BADGE (for bottom nav)
// =================================================================

interface NotificationBadgeProps {
  userId: string;
}

export const NotificationBadge = ({ userId }: NotificationBadgeProps) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(userId, (notifs) => {
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [userId]);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
};