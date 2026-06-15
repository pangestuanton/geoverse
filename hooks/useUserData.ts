"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getUserProfile, getUserProgress, getUserBadges } from "@/lib/firestore";
import type { UserProfile, UserProgress, UserBadge } from "@/types";

function isOfflineError(error: unknown) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (!(error instanceof Error)) return false;

  const maybeError = error as Error & { code?: string };
  return maybeError.code === "unavailable" || maybeError.message.toLowerCase().includes("offline");
}

export function useUserData() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  const fetchData = useCallback(async () => {
    setLoading(true);

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
    } catch (error: unknown) {
      console.error("Gagal memuat data pengguna:", error);
      if (isOfflineError(error)) {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  // Pantau konektivitas browser secara realtime
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      void fetchData();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchData]);

  return { profile, progress, userBadges, loading, isOffline, refetch: fetchData };
}
