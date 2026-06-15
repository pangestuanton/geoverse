"use client";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { moduleSchema, type ModuleFormData } from "@/lib/validations";
import type { ModuleDB } from "@/types";

interface ModuleFormProps {
  initial?: ModuleDB;
  onSubmit: (data: ModuleFormData) => Promise<void>;
  onCancel: () => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ModuleForm({ initial, onSubmit, onCancel }: ModuleFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      slug: initial?.slug || "",
      title: initial?.title || "",
      description: initial?.description || "",
      category: initial?.category || "",
      categoryLabel: initial?.categoryLabel || "",
      readingTime: initial?.readingTime || "",
      difficulty: initial?.difficulty || "Pemula",
      status: initial?.status || "draft",
      sortOrder: initial?.sortOrder || 0,
      content: initial?.content?.length ? initial.content : [""],
      keyPoints: initial?.keyPoints?.length ? initial.keyPoints : [""],
      reflection: initial?.reflection || "",
    },
  });

  // react-hook-form useFieldArray doesn't support string[] directly in strict TS
  // This is a known limitation: https://github.com/react-hook-form/react-hook-form/issues/4534
  // @ts-expect-error - useFieldArray string array limitation
  const contentArr = useFieldArray({ control, name: "content" });
  // @ts-expect-error - useFieldArray string array limitation
  const keyPointsArr = useFieldArray({ control, name: "keyPoints" });

  const handleFormSubmit = async (data: ModuleFormData) => {
    setServerError(null);
    try {
      await onSubmit(data);
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "Gagal menyimpan modul."));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Judul */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Judul Modul *</label>
          <input
            {...register("title")}
            placeholder="Contoh: Mengenal Energi Panas Bumi"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL) *</label>
          <input
            {...register("slug")}
            placeholder="contoh: mengenal-energi-panas-bumi"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
          {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
          <select
            {...register("status")}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="draft">Draft (Tidak tampil ke user)</option>
            <option value="published">Published (Tampil ke user)</option>
          </select>
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kategori *</label>
          <input
            {...register("category")}
            placeholder="contoh: geothermal"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>

        {/* Label Kategori */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Label Kategori *</label>
          <input
            {...register("categoryLabel")}
            placeholder="contoh: Energi Panas Bumi"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.categoryLabel && <p className="text-red-500 text-xs mt-1">{errors.categoryLabel.message}</p>}
        </div>

        {/* Durasi Baca */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Durasi Baca *</label>
          <input
            {...register("readingTime")}
            placeholder="contoh: 8 menit"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.readingTime && <p className="text-red-500 text-xs mt-1">{errors.readingTime.message}</p>}
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat Kesulitan *</label>
          <select
            {...register("difficulty")}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="Pemula">Pemula</option>
            <option value="Menengah">Menengah</option>
            <option value="Lanjutan">Lanjutan</option>
          </select>
        </div>

        {/* Urutan */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Urutan Tampil</label>
          <input
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
            min={0}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi *</label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Deskripsi singkat modul untuk ditampilkan di halaman daftar modul"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      {/* Konten (paragraf) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Konten Modul * <span className="text-slate-400 font-normal">(setiap paragraf)</span></label>
          <button
            type="button"
            onClick={() => contentArr.append("")}
            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Tambah Paragraf
          </button>
        </div>
        <div className="space-y-2">
          {contentArr.fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2">
              <textarea
                {...register(`content.${idx}`)}
                rows={3}
                placeholder={`Paragraf ${idx + 1}`}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              {contentArr.fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => contentArr.remove(idx)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.content && <p className="text-red-500 text-xs mt-1">Konten modul wajib diisi.</p>}
      </div>

      {/* Poin Kunci */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Poin Kunci *</label>
          <button
            type="button"
            onClick={() => keyPointsArr.append("")}
            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Tambah Poin
          </button>
        </div>
        <div className="space-y-2">
          {keyPointsArr.fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`keyPoints.${idx}`)}
                placeholder={`Poin kunci ${idx + 1}`}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {keyPointsArr.fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => keyPointsArr.remove(idx)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.keyPoints && <p className="text-red-500 text-xs mt-1">Minimal 1 poin kunci.</p>}
      </div>

      {/* Refleksi */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Refleksi / Penutup</label>
        <textarea
          {...register("reflection")}
          rows={2}
          placeholder="Kalimat penutup atau ajakan refleksi untuk pembaca"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        {errors.reflection && <p className="text-red-500 text-xs mt-1">{errors.reflection.message}</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Buat Modul"}
        </button>
      </div>
    </form>
  );
}
