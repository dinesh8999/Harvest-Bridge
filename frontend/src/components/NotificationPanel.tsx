// =============================================
// HARVEST BRIDGE — Notification Panel (Light Mode)
// =============================================

import { Bell, X, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import type { Notification } from '../hooks/useApp';
import { formatDistanceToNow } from '../utils/format';

interface Props {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
}

const ICONS = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  critical: Zap,
};
const COLORS = {
  info: 'text-sky-600',
  warning: 'text-amber-600',
  success: 'text-emerald-600',
  critical: 'text-rose-600',
};

export function NotificationPanel({ notifications, onClose, onMarkRead }: Props) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Bell className="w-4 h-4 text-forest-600" />
          Alerts & Notifications
        </div>
        <button onClick={onClose} className="btn-ghost p-1 text-slate-400 hover:text-slate-700">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">
            No active notifications
          </div>
        ) : (
          notifications.map((notif) => {
            const Icon = ICONS[notif.type];
            const color = COLORS[notif.type];
            return (
              <div
                key={notif.id}
                onClick={() => onMarkRead(notif.id)}
                className={`flex gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                  !notif.read ? 'bg-amber-50/40 font-medium' : ''
                }`}
              >
                <div className={`mt-0.5 flex-shrink-0 ${color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 flex items-center justify-between gap-2">
                    <span>{notif.title}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {notif.message}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {formatDistanceToNow(notif.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
