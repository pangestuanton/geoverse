"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Leaf, Loader2 } from "lucide-react";
import { greenLogSchema, type GreenLogFormData } from "@/lib/validations";
import { addGreenLog } from "@/lib/firestore";
import { calculateGreenLogPoints } from "@/lib/points";
import { useAuth } from "@/hooks/useAuth";
import { ACTION_TYPES, WASTE_CATEGORIES, LOCATIONS } from "@/types";

interface GreenLogFormProps {
  onSuccess: () => void;
}

export default function GreenLogForm({ onSuccess }: GreenLogFormProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GreenLogFormData>({
    resolver: zodResolver(greenLogSchema),
    defaultValues: {
      actionDate: new Date().toISOString().split("T")[0],
      estimatedKg: 0,
      note: "",
    },
  });

  const onSubmit = async (data: GreenLogFormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const points = calculateGreenLogPoints({ estimatedKg: data.estimatedKg });

      await addGreenLog(user.uid, {
        userId: user.uid,
        userName: user.displayName || "Pengguna",
        userEmail: user.email || "",
        actionDate: data.actionDate,
        actionType: data.actionType,
        wasteCategory: data.wasteCategory,
        estimatedKg: data.estimatedKg,
        location: data.location,
        note: data.note || "",
        points,
        status: "pending",
      });

      toast.success("Green Log berhasil dicatat. Kecil, tapi tidak sia-sia. 🌱");
      reset();
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Green Log belum bisa disimpan. Periksa koneksi dan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
      <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Leaf className="w-5 h-5 text-emerald-500" />
        Catat Green Log Baru
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tanggal */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Aksi</label>
          <input
            type="date"
            {...register("actionDate")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {errors.actionDate && <p className="text-xs text-red-500 mt-1">{errors.actionDate.message}</p>}
        </div>

        {/* Jenis Aksi */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Aksi</label>
          <select
            {...register("actionType")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
          >
            <option value="">Pilih jenis aksi...</option>
            {ACTION_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.actionType && <p className="text-xs text-red-500 mt-1">{errors.actionType.message}</p>}
        </div>

        {/* Kategori Sampah */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori Sampah</label>
          <select
            {...register("wasteCategory")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
          >
            <option value="">Pilih kategori...</option>
            {WASTE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.wasteCategory && <p className="text-xs text-red-500 mt-1">{errors.wasteCategory.message}</p>}
        </div>

        {/* Estimasi Berat */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Estimasi Berat (kg)</label>
          <input
            type="number"
            step="0.1"
            {...register("estimatedKg", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="0.5"
          />
          {errors.estimatedKg && <p className="text-xs text-red-500 mt-1">{errors.estimatedKg.message}</p>}
        </div>

        {/* Lokasi */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Lokasi</label>
          <select
            {...register("location")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
          >
            <option value="">Pilih lokasi...</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
        </div>

        {/* Catatan */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Catatan Singkat (opsional)</label>
          <textarea
            {...register("note")}
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            placeholder="Ceritakan aksi hijau yang kamu lakukan..."
            maxLength={250}
          />
          {errors.note && <p className="text-xs text-red-500 mt-1">{errors.note.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Leaf className="w-4 h-4" />
            Catat Green Log
          </>
        )}
      </button>
    </form>
  );
}
