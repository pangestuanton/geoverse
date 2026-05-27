"use client";
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, serverTimestamp, getDocs, writeBatch } from "firebase/firestore";
import { getFirebaseDB } from "@/lib/firebase";

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
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Return early if not logged in or not admin
    if (!user || !isAdmin) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const db = getFirebaseDB();
      const q = query(
        collection(db, "adminNotifications"),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: AdminNotification[] = [];
          let unread = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isRead) unread++;
            list.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
            } as AdminNotification);
          });
          setNotifications(list);
          setUnreadCount(unread);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Gagal mendengarkan notifikasi admin:", err);
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error("Kesalahan inisialisasi listener notifikasi:", err);
      setError(err);
      setLoading(false);
    }
  }, [user, isAdmin]);

  const markAsRead = async (id: string) => {
    try {
      const db = getFirebaseDB();
      await updateDoc(doc(db, "adminNotifications", id), {
        isRead: true,
        readAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Gagal menandai notifikasi dibaca:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const db = getFirebaseDB();
      const unreadList = notifications.filter((n) => !n.isRead);
      if (unreadList.length === 0) return;

      const batch = writeBatch(db);
      unreadList.forEach((n) => {
        batch.update(doc(db, "adminNotifications", n.id), {
          isRead: true,
          readAt: serverTimestamp(),
        });
      });
      await batch.commit();
    } catch (err) {
      console.error("Gagal menandai semua notifikasi dibaca:", err);
    }
  };

  return { notifications, unreadCount, loading, error, markAsRead, markAllAsRead };
}
