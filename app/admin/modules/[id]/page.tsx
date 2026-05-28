"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ModuleForm from "@/components/admin/ModuleForm";
import QuizQuestionManager from "@/components/admin/QuizQuestionManager";
import { getModuleWithQuestionsAdmin, updateModule, deleteModule } from "@/lib/modules";
import type { ModuleDB } from "@/types";
import type { ModuleFormData } from "@/lib/validations";
import toast from "react-hot-toast";

export default function AdminModuleDetailPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const params = useParams();
  const router = useRouter();
  const [module, setModule] = useState<ModuleDB | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const moduleId = params.id as string;

  useEffect(() => {
    if (!authLoading && isAdmin && moduleId) {
      getModuleWithQuestionsAdmin(moduleId)
        .then(setModule)
        .catch(() => toast.error("Gagal memuat modul."))
        .finally(() => setDataLoading(false));
    }
  }, [authLoading, isAdmin, moduleId]);

  const handleUpdate = async (data: ModuleFormData) => {
    await updateModule(moduleId, {
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
    toast.success("Modul berhasil diperbarui!");
    setModule((prev) => prev ? { ...prev, ...data, categoryLabel: data.categoryLabel, sortOrder: data.sortOrder } : prev);
    setEditMode(false);
  };

  const handleDelete = async () => {
    if (!confirm("Arsipkan modul ini? Modul akan diubah ke status Draft dan tidak tampil ke user. Progress user tidak akan hilang.")) return;
    setDeleting(true);
    try {
      await deleteModule(moduleId);
      toast.success("Modul berhasil diarsipkan.");
      router.push("/admin/modules");
    } catch {
      toast.error("Gagal mengarsipkan modul.");
      setDeleting(false);
    }
  };

  const toggleStatus = async () => {
    if (!module) return;
    const newStatus = module.status === "published" ? "draft" : "published";
    await updateModule(moduleId, { status: newStatus });
    setModule((prev) => prev ? { ...prev, status: newStatus } : prev);
    toast.success(newStatus === "published" ? "Modul dipublish!" : "Modul dijadikan draft.");
  };

  if (authLoading || dataLoading) return <AdminSidebar><LoadingSpinner /></AdminSidebar>;
  if (!isAdmin) return null;
  if (!module) return (
    <AdminSidebar>
      <div className="text-center py-20">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="text-slate-600">Modul tidak ditemukan.</p>
        <Link href="/admin/modules" className="text-emerald-600 hover:underline text-sm mt-2 inline-block">← Kembali</Link>
      </div>
    </AdminSidebar>
  );

  return (
    <AdminSidebar>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <Link
              href="/admin/modules"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar Modul
            </Link>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {module.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                module.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}>
                {module.status === "published" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {module.status === "published" ? "Published" : "Draft"}
              </span>
              <span className="text-xs text-slate-400 font-mono">{module.slug}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleStatus}
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl font-medium border transition-colors ${
                module.status === "published"
                  ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                  : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              {module.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {module.status === "published" ? "Jadikan Draft" : "Publish"}
            </button>
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl font-medium transition-colors"
            >
              {editMode ? "Batal Edit" : "Edit Modul"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:bg-red-50 border border-red-200 px-3 py-2 rounded-xl font-medium transition-colors"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Arsipkan
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {editMode && (
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Edit Modul</h2>
            <ModuleForm
              initial={module}
              onSubmit={handleUpdate}
              onCancel={() => setEditMode(false)}
            />
          </div>
        )}

        {/* Module Preview (jika tidak edit) */}
        {!editMode && (
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Kategori</p>
                <p className="font-medium text-slate-700">{module.categoryLabel}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Durasi</p>
                <p className="font-medium text-slate-700">{module.readingTime}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Tingkat</p>
                <p className="font-medium text-slate-700">{module.difficulty}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Urutan</p>
                <p className="font-medium text-slate-700">{module.sortOrder}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Deskripsi</p>
              <p className="text-sm text-slate-700">{module.description}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Jumlah Paragraf</p>
              <p className="text-sm text-slate-700">{module.content.length} paragraf</p>
            </div>
          </div>
        )}

        {/* Quiz Questions */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <QuizQuestionManager
            moduleId={moduleId}
            initialQuestions={module.questions || []}
          />
        </div>
      </div>
    </AdminSidebar>
  );
}
