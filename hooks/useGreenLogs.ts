"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getUserGreenLogs } from "@/lib/firestore";
import type { GreenLog } from "@/types";

export function useGreenLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<GreenLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
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
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  return { logs, loading, refetch: fetchLogs };
}
