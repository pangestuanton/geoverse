"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, BookOpen, Eye, EyeOff, Edit, Loader2 } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getAllModulesAdmin, createModule } from "@/lib/modules";
import type { ModuleDB } from "@/types";
import type { ModuleFormData } from "@/lib/validations";
import ModuleForm from "@/components/admin/ModuleForm";
import toast from "react-hot-toast";

export default function AdminModulesPage() {
  const { loading, isAdmin } = useAdminGuard();
  const [modules, setModules] = useState<ModuleDB[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchModules = async () => {
    try {
      const data = await getAllModulesAdmin();
      setModules(data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat modul.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && isAdmin) fetchModules();
  }, [loading, isAdmin]);

  const handleCreate = async (data: ModuleFormData) => {
    await createModule({
      slug: data.slug,
      title: data.title,
      description: data.description,
      category: data.category,
      categoryLabel: data.categoryLabel,
      readingTime: data.readingTime,
      difficulty: data.difficulty,
      content: data.content,
      keyPoints: data.keyPoints,
      reflection: data.reflection,
      status: data.status,
      sortOrder: data.sortOrder,
    });
    toast.success("Modul berhasil dibuat!");
    setShowCreateForm(false);
    fetchModules();
  };

  if (loading || dataLoading) return <AdminSidebar><LoadingSpinner /></AdminSidebar>;
  if (!isAdmin) return null;

  const publishedCount = modules.filter((m) => m.status === "published").length;
  const draftCount = modules.filter((m) => m.status === "draft").length;

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Kelola Modul
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {modules.length} modul total ·{" "}
              <span className="text-emerald-600">{publishedCount} published</span> ·{" "}
              <span className="text-slate-400">{draftCount} draft</span>
            </p>
          </div>
          {!showCreateForm && (
            <button
              id="btn-create-module"
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buat Modul Baru
            </button>
          )}
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Buat Modul Baru
            </h2>
            <ModuleForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
          </div>
        )}

        {/* Modules Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-50 border-b border-emerald-100">
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Judul Modul</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Kategori</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Durasi</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Tingkat</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Urutan</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {modules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Belum ada modul. Buat modul pertama!</p>
                    </td>
                  </tr>
                ) : (
                  modules.map((mod) => (
                    <tr key={mod.id} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{mod.title}</div>
                        <div className="text-xs text-slate-400 font-mono">{mod.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{mod.categoryLabel}</td>
                      <td className="px-6 py-4 text-slate-500">{mod.readingTime}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mod.difficulty === "Pemula" ? "bg-emerald-100 text-emerald-700" :
                          mod.difficulty === "Menengah" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {mod.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{mod.sortOrder}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                          mod.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {mod.status === "published" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {mod.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/modules/${mod.id}`}
                          className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
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
