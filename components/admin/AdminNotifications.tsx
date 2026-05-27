"use client";
import { useAdminNotifications, type AdminNotification } from "@/hooks/useAdminNotifications";
import { User, Leaf, BookOpen, Award, Check, CheckSquare, Bell, Clock, Eye, AlertTriangle } from "lucide-react";

const typeStyles: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  new_user: {
    icon: User,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  new_green_log: {
    icon: Leaf,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  new_progress: {
    icon: BookOpen,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  user_activity: {
    icon: Award,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
};

export default function AdminNotifications() {
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead } = useAdminNotifications();

  const formatTime = (date: any) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " - " + d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm space-y-4 animate-pulse">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-slate-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-48 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h4 className="font-semibold text-slate-800 mb-1">Gagal memuat notifikasi</h4>
        <p className="text-xs text-slate-500">Pastikan Anda memiliki hak akses administrator.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[480px]">
      {/* Header */}
      <div className="p-5 border-b border-emerald-50 flex items-center justify-between bg-[#fcfdfd]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Notifikasi Aktivitas
            </h3>
            <p className="text-xs text-slate-500">{unreadCount} belum dibaca</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors bg-emerald-50 hover:bg-emerald-100/50 px-2.5 py-1.5 rounded-lg"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-emerald-50/50 p-4 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center text-slate-400">
            <Bell className="w-10 h-10 mb-3 stroke-[1.5]" />
            <p className="text-sm font-medium">Belum ada notifikasi masuk</p>
            <p className="text-xs text-slate-400 mt-1">Seluruh aktivitas pengguna akan muncul di sini secara realtime.</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const style = typeStyles[notification.type] || typeStyles.user_activity;
            const Icon = style.icon;

            return (
              <div
                key={notification.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 group relative ${
                  notification.isRead
                    ? "bg-white border-transparent hover:bg-slate-50/30"
                    : "bg-emerald-50/20 border-emerald-100/30 shadow-sm shadow-emerald-50/10 hover:bg-emerald-50/30"
                }`}
              >
                {/* Icon box */}
                <div className={`w-10 h-10 ${style.bg} ${style.color} ${style.border} border rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm text-slate-800">{notification.title}</span>
                    {!notification.isRead && (
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notification.message}</p>
                  
                  {/* User details */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                      {notification.userName}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Mark as read button */}
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    title="Tandai sudah dibaca"
                    className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white hover:bg-emerald-50 border border-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-lg shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
