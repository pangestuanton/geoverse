"use client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { GreenLog } from "@/types";

interface AdminChartProps {
  logs: GreenLog[];
}

export default function AdminChart({ logs }: AdminChartProps) {
  const weeklyData = useMemo(() => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const counts = new Array(7).fill(0);
    logs.forEach((log) => {
      const date = new Date(log.actionDate);
      const day = date.getDay();
      counts[day === 0 ? 6 : day - 1]++;
    });
    return days.map((d, i) => ({ name: d, jumlah: counts[i] }));
  }, [logs]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
      <h3 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Aktivitas Green Log
      </h3>
      <ResponsiveContainer width="100%" height={280} debounce={100}>
        <BarChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="jumlah" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
