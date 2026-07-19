"use client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { GreenLog } from "@/types";

const PIE_COLORS = ["#2d9464", "#0d9488", "#f59e0b", "#0ea5e9", "#ef4444", "#78716c"];

interface DashboardChartProps {
  logs: GreenLog[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg shadow-card px-3 py-2 text-xs">
        <p className="font-semibold text-charcoal-500">{label}</p>
        <p className="text-brand-600">{payload[0].value} aksi</p>
      </div>
    );
  }
  return null;
};

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
      <div className="bg-white rounded-2xl p-8 shadow-card border border-brand-100 text-center">
        <p className="text-stone-400 text-sm">Belum ada data untuk ditampilkan. Mulai catat Green Log untuk melihat grafik aktivitas kamu.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-100">
        <h3 className="font-bold text-charcoal-500 mb-4">Aktivitas Green Log Mingguan</h3>
        <ResponsiveContainer width="100%" height={240} debounce={100}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#78716c" }} allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="jumlah" fill="#2d9464" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-100">
        <h3 className="font-bold text-charcoal-500 mb-4">Distribusi Kategori Sampah</h3>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240} debounce={100}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" label={({ name }) => name}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-stone-400 text-sm text-center py-12">Belum ada data kategori.</p>
        )}
      </div>
    </div>
  );
}
