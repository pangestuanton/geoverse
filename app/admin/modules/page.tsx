"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, BookOpen, Eye, EyeOff, Edit } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { ModuleDB } from "@/types";
import type { ModuleFormData } from "@/lib/validations";
import ModuleForm from "@/components/admin/ModuleForm";
import toast from "react-hot-toast";

export default function AdminModulesPage() {
  const { loading, isAdmin } = useAdminGuard();
  const [modules, setModules] = useState<ModuleDB[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchModules = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/modules");
      const payload = (await response.json().catch(() => null)) as { modules?: ModuleDB[]; error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || "Gagal memuat modul.");
      setModules(payload?.modules || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat modul.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && isAdmin) void Promise.resolve().then(fetchModules);
  }, [loading, isAdmin, fetchModules]);

  const handleCreate = async (data: ModuleFormData) => {
    const response = await fetch("/api/admin/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) throw new Error(payload?.error || "Gagal membuat modul.");
    toast.success("Modul berhasil dibuat!");
    setShowCreateForm(false);
    fetchModules();
  };

  if (loading || dataLoading) return <AdminSidebar><LoadingSpinner text="Memuat modul..." /></AdminSidebar>;
  if (!isAdmin) return null;

  const publishedCount = modules.filter((m) => m.status === "published").length;
  const draftCount = modules.filter((m) => m.status === "draft").length;

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-600 tracking-tight">
              Kelola Modul
            </h1>
            <p className="text-stone-400 text-sm mt-1">
              {modules.length} modul total &middot;{" "}
              <span className="text-leaf-600 font-medium">{publishedCount} published</span> &middot;{" "}
              <span className="text-stone-400">{draftCount} draft</span>
            </p>
          </div>
          {!showCreateForm && (
            <button
              id="btn-create-module"
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buat Modul Baru
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-2xl border border-brand-100 shadow-card p-6">
            <h2 className="font-bold text-charcoal-500 mb-4">Buat Modul Baru</h2>
            <ModuleForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card border border-brand-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-50 border-b border-brand-100">
                  {["Judul Modul", "Kategori", "Durasi", "Tingkat", "Urutan", "Status", "Aksi"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 font-semibold text-charcoal-400 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-stone-400">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Belum ada modul. Buat modul pertama!</p>
                    </td>
                  </tr>
                ) : (
                  modules.map((mod) => (
                    <tr key={mod.id} className="border-b border-stone-50 hover:bg-brand-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-charcoal-400">{mod.title}</div>
                        <div className="text-xs text-stone-400 font-mono">{mod.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-stone-500">{mod.categoryLabel}</td>
                      <td className="px-6 py-4 text-stone-500">{mod.readingTime}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                          mod.difficulty === "Pemula" ? "bg-leaf-50 text-leaf-600 border-leaf-200" :
                          mod.difficulty === "Menengah" ? "bg-earth-50 text-earth-600 border-earth-200" :
                          "bg-red-50 text-red-600 border-red-200"
                        }`}>{mod.difficulty}</span>
                      </td>
                      <td className="px-6 py-4 text-stone-500">{mod.sortOrder}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                          mod.status === "published"
                            ? "bg-leaf-50 text-leaf-600 border-leaf-200"
                            : "bg-stone-100 text-stone-400 border-stone-200"
                        }`}>
                          {mod.status === "published" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {mod.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/modules/${mod.id}`}
                          className="inline-flex items-center gap-1.5 text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Kelola
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
