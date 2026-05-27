"use client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { GreenLog } from "@/types";

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"];

interface DashboardChartProps {
  logs: GreenLog[];
}

export default function DashboardChart({ logs }: DashboardChartProps) {
  const weeklyData = useMemo(() => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const counts = new Array(7).fill(0);
    logs.forEach((log) => {
      const date = new Date(log.actionDate);
      const day = date.getDay();
      const idx = day === 0 ? 6 : day - 1;
      counts[idx]++;
    });
    return days.map((d, i) => ({ name: d, jumlah: counts[i] }));
  }, [logs]);

  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    logs.forEach((log) => {
      catMap[log.wasteCategory] = (catMap[log.wasteCategory] || 0) + 1;
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-emerald-100 text-center">
        <p className="text-slate-500">Belum ada data untuk ditampilkan. Mulai catat Green Log untuk melihat grafikmu.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <h3 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Aktivitas Green Log Mingguan
        </h3>
        <ResponsiveContainer width="100%" height={240} debounce={100}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="jumlah" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <h3 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Distribusi Kategori Sampah
        </h3>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240} debounce={100}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-center py-12">Belum ada data kategori.</p>
        )}
      </div>
    </div>
  );
}
