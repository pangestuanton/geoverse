"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getUserGreenLogs } from "@/lib/firestore";
import type { GreenLog } from "@/types";

export function useGreenLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<GreenLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);

    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      const data = await getUserGreenLogs(user.uid);
      setLogs(data);
    } catch (error) {
      console.error("Gagal memuat Green Log:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(fetchLogs);
  }, [fetchLogs]);

  return { logs, loading, refetch: fetchLogs };
}
