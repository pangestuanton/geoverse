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
    watch,
    formState: { errors },
  } = useForm<GreenLogFormData>({
    resolver: zodResolver(greenLogSchema),
    defaultValues: {
      actionDate: new Date().toISOString().split("T")[0],
      estimatedKg: 0,
      note: "",
    },
  });

  const estimatedKg = watch("estimatedKg") ?? 0;
  const previewPoints = calculateGreenLogPoints({ estimatedKg });
  const inputClasses = "w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-100 transition-all bg-white";

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

      toast.success("Green Log berhasil dicatat! Menunggu verifikasi admin.");
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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 shadow-card border border-brand-100">
      <h3 className="font-bold text-charcoal-500 mb-6 flex items-center gap-2">
        <Leaf className="w-5 h-5 text-brand-500" />
        Catat Green Log Baru
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5">Tanggal Aksi</label>
          <input type="date" {...register("actionDate")} className={inputClasses} />
          {errors.actionDate && <p className="text-xs text-red-500 mt-1">{errors.actionDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5">Jenis Aksi</label>
          <select {...register("actionType")} className={inputClasses}>
            <option value="">Pilih jenis aksi...</option>
            {ACTION_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.actionType && <p className="text-xs text-red-500 mt-1">{errors.actionType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5">Kategori Sampah</label>
          <select {...register("wasteCategory")} className={inputClasses}>
            <option value="">Pilih kategori...</option>
            {WASTE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.wasteCategory && <p className="text-xs text-red-500 mt-1">{errors.wasteCategory.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5">Estimasi Berat (kg)</label>
          <input
            type="number"
            step="0.1"
            {...register("estimatedKg", { valueAsNumber: true })}
            className={inputClasses}
            placeholder="0.5"
          />
          {errors.estimatedKg && <p className="text-xs text-red-500 mt-1">{errors.estimatedKg.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5">Lokasi</label>
          <select {...register("location")} className={inputClasses}>
            <option value="">Pilih lokasi...</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5">Catatan Singkat (opsional)</label>
          <textarea
            {...register("note")}
            rows={3}
            className={`${inputClasses} resize-none`}
            placeholder="Ceritakan aksi hijau yang kamu lakukan..."
            maxLength={250}
          />
          {errors.note && <p className="text-xs text-red-500 mt-1">{errors.note.message}</p>}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 p-3 bg-brand-50 rounded-xl text-sm text-brand-700">
        <Leaf className="w-4 h-4 shrink-0" />
        <span>Poin estimasi: <strong>{previewPoints} poin</strong> (diberikan setelah admin menyetujui)</span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
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
