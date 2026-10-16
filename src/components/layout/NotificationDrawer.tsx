import React, { useState } from 'react';
import { X, CheckCheck, Bell, AlertTriangle, Utensils, Calendar, ShieldCheck, CreditCard, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SystemNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => filter === 'all' || !n.isRead);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'order':
        return <Utensils className="w-4 h-4 text-[#f5764b]" />;
      case 'kitchen':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'reservation':
        return <Calendar className="w-4 h-4 text-[#f5764b]" />;
      case 'stock':
        return <Package className="w-4 h-4 text-red-600" />;
      case 'approval':
        return <ShieldCheck className="w-4 h-4 text-gray-700" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleNotificationClick = (notif: SystemNotification) => {
    markNotificationRead(notif.id);
    if (notif.linkPage) {
      onNavigate(notif.linkPage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/20">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 max-h-[90vh] overflow-y-auto">
        <div className="w-screen max-w-md bg-white shadow-xs flex flex-col border-l border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
                <p className="text-[11px] text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="p-1 text-xs text-[#f5764b] hover:text-[#e05a2b] hover:bg-orange-50 rounded flex items-center gap-1 font-medium transition-colors"
                  title="Mark all read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark All Read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#f5764b] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-[#f5764b] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-white">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No notifications found.</p>
              </div>
            ) : (
              filtered.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notif.isRead ? 'bg-orange-50/20' : ''
                  }`}
                >
                  <div className="p-2 rounded bg-gray-50 border border-gray-200 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.linkPage && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-[#f5764b] hover:underline">
                        View details →
                      </span>
                    )}
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#f5764b] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
