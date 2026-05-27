"use client";

export interface AdminNotification {
  id: string;
  type: "new_user" | "new_green_log" | "new_challenge" | "new_progress" | "user_activity";
  title: string;
  message: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  sourceCollection?: string;
  sourceId?: string;
  isRead: boolean;
  createdAt: any;
}

export function useAdminNotifications() {
  return {
    notifications: [] as AdminNotification[],
    unreadCount: 0,
    loading: false,
    error: null,
    markAsRead: async (id: string) => {},
    markAllAsRead: async () => {},
  };
}
