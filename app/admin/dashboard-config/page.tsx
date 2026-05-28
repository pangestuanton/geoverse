"use client";
import { useState, useEffect } from "react";
import { Loader2, Save, ToggleLeft, ToggleRight, Megaphone, BookOpen, Users, Trophy } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getAllDashboardConfigsAdmin, upsertDashboardConfig } from "@/lib/dashboard";
import toast from "react-hot-toast";

interface ConfigRow {
  id: string;
  key: string;
  value: Record<string, unknown>;
  isActive: boolean;
}

const CONFIG_LABELS: Record<string, { label: string; description: string; icon: React.ComponentType<any> }> = {
  show_challenges: {
    label: "Tampilkan Seksi Tantangan",
    description: "Tampilkan atau sembunyikan bagian Tantangan di dashboard user.",
    icon: Trophy,
  },
  show_leaderboard: {
    label: "Tampilkan Papan Peringkat",
    description: "Tampilkan atau sembunyikan bagian Papan Peringkat di dashboard user.",
    icon: Users,
  },
  featured_module_slug: {
    label: "Modul Unggulan",
    description: "Slug modul yang ditampilkan sebagai sorotan di dashboard.",
    icon: BookOpen,
  },
  announcement: {
    label: "Pengumuman",
    description: "Tampilkan banner pengumuman di dashboard user.",
    icon: Megaphone,
  },
};

export default function AdminDashboardConfigPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const [configs, setConfigs] = useState<ConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Local editable states
  const [showChallenges, setShowChallenges] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [featuredSlug, setFeaturedSlug] = useState("");
  const [featuredActive, setFeaturedActive] = useState(false);
  const [announcement, setAnnouncement] = useState({ title: "", body: "", type: "info" as const });
  const [announcementActive, setAnnouncementActive] = useState(false);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      getAllDashboardConfigsAdmin()
        .then((data) => {
          setConfigs(data);
          for (const row of data) {
            if (row.key === "show_challenges") setShowChallenges((row.value as any)?.enabled ?? true);
            if (row.key === "show_leaderboard") setShowLeaderboard((row.value as any)?.enabled ?? true);
            if (row.key === "featured_module_slug") {
              setFeaturedSlug((row.value as any)?.slug ?? "");
              setFeaturedActive(row.isActive);
            }
            if (row.key === "announcement") {
              setAnnouncement({
                title: (row.value as any)?.title || "",
                body: (row.value as any)?.body || "",
                type: (row.value as any)?.type || "info",
              });
              setAnnouncementActive(row.isActive);
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [authLoading, isAdmin]);

  const saveConfig = async (key: string, value: Record<string, unknown>, isActive: boolean) => {
    setSaving(key);
    try {
      await upsertDashboardConfig(key, value, isActive);
      toast.success("Konfigurasi berhasil disimpan!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan konfigurasi.");
    } finally {
      setSaving(null);
    }
  };

  if (authLoading || loading) return <AdminSidebar><LoadingSpinner /></AdminSidebar>;
  if (!isAdmin) return null;

  return (
    <AdminSidebar>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Konfigurasi Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kontrol tampilan dan fitur dashboard pengguna secara real-time.
          </p>
        </div>

        {/* Toggle: Show Challenges */}
        <ConfigCard
          label={CONFIG_LABELS.show_challenges.label}
          description={CONFIG_LABELS.show_challenges.description}
          Icon={CONFIG_LABELS.show_challenges.icon}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowChallenges(!showChallenges)}
              className="flex items-center gap-2 text-sm"
            >
              {showChallenges ? (
                <ToggleRight className="w-8 h-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300" />
              )}
              <span className={showChallenges ? "text-emerald-600 font-medium" : "text-slate-400"}>
                {showChallenges ? "Ditampilkan" : "Disembunyikan"}
              </span>
            </button>
            <SaveButton
              saving={saving === "show_challenges"}
              onClick={() => saveConfig("show_challenges", { enabled: showChallenges }, true)}
            />
          </div>
        </ConfigCard>

        {/* Toggle: Show Leaderboard */}
        <ConfigCard
          label={CONFIG_LABELS.show_leaderboard.label}
          description={CONFIG_LABELS.show_leaderboard.description}
          Icon={CONFIG_LABELS.show_leaderboard.icon}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="flex items-center gap-2 text-sm"
            >
              {showLeaderboard ? (
                <ToggleRight className="w-8 h-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300" />
              )}
              <span className={showLeaderboard ? "text-emerald-600 font-medium" : "text-slate-400"}>
                {showLeaderboard ? "Ditampilkan" : "Disembunyikan"}
              </span>
            </button>
            <SaveButton
              saving={saving === "show_leaderboard"}
              onClick={() => saveConfig("show_leaderboard", { enabled: showLeaderboard }, true)}
            />
          </div>
        </ConfigCard>

        {/* Featured Module */}
        <ConfigCard
          label={CONFIG_LABELS.featured_module_slug.label}
          description={CONFIG_LABELS.featured_module_slug.description}
          Icon={CONFIG_LABELS.featured_module_slug.icon}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={featuredSlug}
                onChange={(e) => setFeaturedSlug(e.target.value)}
                placeholder="contoh: mengenal-energi-panas-bumi"
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredActive}
                  onChange={(e) => setFeaturedActive(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
                Aktifkan Modul Unggulan
              </label>
              <SaveButton
                saving={saving === "featured_module_slug"}
                onClick={() =>
                  saveConfig("featured_module_slug", { slug: featuredSlug }, featuredActive && !!featuredSlug)
                }
              />
            </div>
          </div>
        </ConfigCard>

        {/* Announcement */}
        <ConfigCard
          label={CONFIG_LABELS.announcement.label}
          description={CONFIG_LABELS.announcement.description}
          Icon={CONFIG_LABELS.announcement.icon}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Judul Pengumuman</label>
              <input
                type="text"
                value={announcement.title}
                onChange={(e) => setAnnouncement((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Pembaruan Sistem"
                maxLength={80}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Isi Pengumuman</label>
              <textarea
                value={announcement.body}
                onChange={(e) => setAnnouncement((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Tulis isi pengumuman di sini..."
                rows={3}
                maxLength={500}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipe</label>
              <select
                value={announcement.type}
                onChange={(e) => setAnnouncement((prev) => ({ ...prev, type: e.target.value as any }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="info">Info (Biru)</option>
                <option value="success">Sukses (Hijau)</option>
                <option value="warning">Peringatan (Kuning)</option>
                <option value="danger">Penting (Merah)</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
                Tampilkan Pengumuman
              </label>
              <SaveButton
                saving={saving === "announcement"}
                onClick={() =>
                  saveConfig("announcement", announcement as Record<string, unknown>, announcementActive && !!announcement.body)
                }
              />
            </div>
          </div>
        </ConfigCard>
      </div>
    </AdminSidebar>
  );
}

function ConfigCard({
  label,
  description,
  Icon,
  children,
}: {
  label: string;
  description: string;
  Icon: React.ComponentType<any>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">{label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-3 py-2 rounded-xl font-medium transition-colors shrink-0"
    >
      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
      Simpan
    </button>
  );
}
