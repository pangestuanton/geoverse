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
    } catch (error) {
      console.error("Gagal memuat data pengguna:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return { profile, progress, userBadges, loading, refetch: fetchData };
}
