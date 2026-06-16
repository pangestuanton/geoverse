"use client";
import { useState } from "react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit2, ToggleLeft, ToggleRight, Gift, Loader2, X, Award } from "lucide-react";
import { badgeSchema, awardBadgeSchema, type BadgeFormData, type AwardBadgeFormData } from "@/lib/validations";
import {
  createBadge,
  updateBadge,
  toggleBadgeActive,
} from "@/lib/badges";
import type { BadgeDB } from "@/types";
import type { UserProfile } from "@/types";
import toast from "react-hot-toast";

interface BadgeManagerProps {
  initialBadges: BadgeDB[];
  users: UserProfile[];
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function BadgeManager({ initialBadges, users }: BadgeManagerProps) {
  const [badges, setBadges] = useState<BadgeDB[]>(initialBadges);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeDB | null>(null);
  const [showAwardPanel, setShowAwardPanel] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleCreate = async (data: BadgeFormData) => {
    const newBadge = await createBadge({
      slug: data.slug,
      name: data.name,
      description: data.description,
      icon: data.icon,
      category: data.category,
    });
    setBadges((prev) => [newBadge, ...prev]);
    setShowCreateForm(false);
    toast.success("Badge berhasil dibuat!");
  };

  const handleUpdate = async (data: BadgeFormData) => {
    if (!editingBadge) return;
    await updateBadge(editingBadge.id, {
      slug: data.slug,
      name: data.name,
      description: data.description,
      icon: data.icon,
      category: data.category,
    });
    setBadges((prev) =>
      prev.map((b) => (b.id === editingBadge.id ? { ...b, ...data } : b))
    );
    setEditingBadge(null);
    toast.success("Badge berhasil diperbarui!");
  };

  const handleToggleActive = async (badge: BadgeDB) => {
    setTogglingId(badge.id);
    try {
      await toggleBadgeActive(badge.id, !badge.isActive);
      setBadges((prev) =>
        prev.map((b) => (b.id === badge.id ? { ...b, isActive: !badge.isActive } : b))
      );
      toast.success(badge.isActive ? "Badge dinonaktifkan." : "Badge diaktifkan.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Badge List */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-800 text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Daftar Badge
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAwardPanel(!showAwardPanel)}
            className="flex items-center gap-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl font-medium transition-colors"
          >
            <Gift className="w-4 h-4" />
            Berikan Badge
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Badge Baru
          </button>
        </div>
      </div>

      {/* Award Panel */}
      {showAwardPanel && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Berikan Badge ke Pengguna</h3>
            <button onClick={() => setShowAwardPanel(false)} className="p-1 hover:bg-amber-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <AwardBadgeForm
            badges={badges.filter((b) => b.isActive)}
            users={users}
            onSuccess={() => setShowAwardPanel(false)}
          />
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Badge Baru</h3>
            <button onClick={() => setShowCreateForm(false)} className="p-1 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <BadgeForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
        </div>
      )}

      {/* Edit Form */}
      {editingBadge && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Edit Badge: {editingBadge.name}</h3>
            <button onClick={() => setEditingBadge(null)} className="p-1 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <BadgeForm
            initial={editingBadge}
            onSubmit={handleUpdate}
            onCancel={() => setEditingBadge(null)}
          />
        </div>
      )}

      {/* Badges Grid */}
      {badges.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Belum ada badge. Buat badge pertama!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`bg-white border rounded-2xl p-4 transition-all ${
                badge.isActive ? "border-emerald-100" : "border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                    {badge.icon.startsWith("http") ? (
                      <Image src={badge.icon} alt={badge.name} width={32} height={32} className="w-8 h-8 object-contain" />
                    ) : (
                      badge.icon
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{badge.name}</h4>
                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                      {badge.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingBadge(badge)}
                    className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(badge)}
                    disabled={togglingId === badge.id}
                    className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                  >
                    {togglingId === badge.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : badge.isActive ? (
                      <ToggleRight className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{badge.description}</p>
              {!badge.isActive && (
                <div className="mt-2 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                  ● Nonaktif - tidak tampil ke user
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Badge Form =====
function BadgeForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: BadgeDB;
  onSubmit: (data: BadgeFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BadgeFormData>({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
      slug: initial?.slug || "",
      name: initial?.name || "",
      description: initial?.description || "",
      icon: initial?.icon || "🏅",
      category: initial?.category || "umum",
    },
  });

  const iconValue = useWatch({ control, name: "icon" });

  const handleFormSubmit = async (data: BadgeFormData) => {
    setServerError(null);
    try {
      await onSubmit(data);
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "Gagal menyimpan badge."));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Badge *</label>
          <input
            {...register("name")}
            placeholder="Contoh: Pemula Hijau"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
          <input
            {...register("slug")}
            placeholder="pemula-hijau"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
          {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Icon * <span className="text-slate-400 text-xs">(emoji atau URL)</span></label>
          <div className="flex gap-2">
            <input
              {...register("icon")}
              placeholder="🌱 atau https://..."
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center text-xl bg-slate-50">
              {iconValue?.startsWith("http") ? (
                <Image
                  src={iconValue}
                  alt=""
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : iconValue || "🏅"}
            </div>
          </div>
          {errors.icon && <p className="text-red-500 text-xs mt-1">{errors.icon.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kategori *</label>
          <input
            {...register("category")}
            placeholder="Contoh: green-log, modul, tantangan"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi *</label>
        <textarea
          {...register("description")}
          rows={2}
          placeholder="Deskripsi singkat tentang bagaimana mendapatkan badge ini"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {initial ? "Simpan Perubahan" : "Buat Badge"}
        </button>
      </div>
    </form>
  );
}

// ===== Award Badge Form =====
function AwardBadgeForm({
  badges,
  users,
  onSuccess,
}: {
  badges: BadgeDB[];
  users: UserProfile[];
  onSuccess: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AwardBadgeFormData>({
    resolver: zodResolver(awardBadgeSchema),
    defaultValues: { userId: "", badgeId: "", note: "" },
  });

  const handleFormSubmit = async (data: AwardBadgeFormData) => {
    setServerError(null);
    try {
      const response = await fetch("/api/admin/badges/award", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Gagal memberikan badge.");
      }

      toast.success("Badge berhasil diberikan ke pengguna!");
      reset();
      onSuccess();
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "Gagal memberikan badge."));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pengguna *</label>
          <select
            {...register("userId")}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            <option value="">-- Pilih pengguna --</option>
            {users
              .filter((u) => u.role !== "admin")
              .map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.displayName || u.name} - {u.email}
                </option>
              ))}
          </select>
          {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Badge *</label>
          <select
            {...register("badgeId")}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            <option value="">-- Pilih badge --</option>
            {badges.map((b) => (
              <option key={b.id} value={b.id}>
                {b.icon} {b.name}
              </option>
            ))}
          </select>
          {errors.badgeId && <p className="text-red-500 text-xs mt-1">{errors.badgeId.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Catatan (opsional)</label>
        <input
          {...register("note")}
          placeholder="Contoh: Diberikan atas prestasi khusus"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Memproses..." : "Berikan Badge"}
      </button>
    </form>
  );
}
