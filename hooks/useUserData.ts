"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getUserProfile, getUserProgress, getUserBadges } from "@/lib/firestore";
import type { UserProfile, UserProgress, UserBadge } from "@/types";

export function useUserData() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const fetchData = async () => {
    if (!user) {
      setProfile(null);
      setProgress([]);
      setUserBadges([]);
      setLoading(false);
      return;
    }

    try {
      const [profileData, progressData, badgesData] = await Promise.all([
        getUserProfile(user.uid),
        getUserProgress(user.uid),
        getUserBadges(user.uid),
      ]);
      setProfile(profileData);
      setProgress(progressData);
      setUserBadges(badgesData);
      setIsOffline(false);
    } catch (error: any) {
      console.error("Gagal memuat data pengguna:", error);
      // Deteksi jika perangkat sedang offline atau koneksi Firebase terputus
      if (!navigator.onLine || error.code === "unavailable" || error.message?.includes("offline")) {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Pantau konektivitas browser secara realtime
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchData();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { profile, progress, userBadges, loading, isOffline, refetch: fetchData };
}
