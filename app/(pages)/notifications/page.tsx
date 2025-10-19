'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { 
  subscribeToNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from '@/lib/notificationService';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬';
      case 'like': return '❤️';
      case 'comment': return '💭';
      case 'reply': return '↩️';
      case 'follow': return '👤';
      case 'mention': return '@';
      case 'quest_invite': return '🎯';
      case 'group_add': return '👥';
      case 'event_reminder': return '📅';
      default: return '🔔';
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

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">Please sign in to view notifications</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell size={28} />
              Notifications
              {unreadCount > 0 && (
                <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead(user.uid)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#EA6100] text-black rounded-lg font-medium hover:bg-[#f5c094] transition-colors text-sm"
                >
                  <CheckCheck size={18} />
                  Mark All Read
                </button>
              )}
              
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Delete all notifications?')) {
                      deleteAllNotifications(user.uid);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 size={18} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#EA6100] text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-[#EA6100] text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto p-4">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Bell size={40} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-400">
              {filter === 'unread' 
                ? "You're all caught up!"
                : 'When you get notifications, theyll show up here'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map(notif => (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`w-full p-4 flex items-start gap-4 rounded-lg border transition-colors text-left ${
                  !notif.read
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-gray-900 border-gray-800 hover:bg-gray-850'
                }`}
              >
                {/* Avatar with Icon */}
                <div className="relative flex-shrink-0">
                  <img
                    src={notif.senderPhoto || '/default-avatar.png'}
                    alt={notif.senderName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-900">
                    <span className="text-sm">
                      {getNotificationIcon(notif.type)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium mb-1">
                    {notif.title}
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTime(notif.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {!notif.read && (
                    <div className="w-3 h-3 bg-[#EA6100] rounded-full"></div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors p-2"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}