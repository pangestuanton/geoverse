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
      counts[date.getDay() === 0 ? 6 : date.getDay() - 1]++;
    });
    return days.map((d, i) => ({ name: d, jumlah: counts[i] }));
  }, [logs]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-100">
      <h3 className="font-bold text-charcoal-500 mb-4">
        Aktivitas Green Log
      </h3>
      <ResponsiveContainer width="100%" height={280} debounce={100}>
        <BarChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#78716c" }} allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="jumlah" fill="#2d9464" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
