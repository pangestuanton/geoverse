"use client";
import { useState, useEffect } from "react";
import { Loader2, Save, ToggleLeft, ToggleRight, Megaphone, BookOpen, Users, Trophy, type LucideIcon } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import toast from "react-hot-toast";

interface ConfigRow {
  id: string;
  key: string;
  value: Record<string, unknown>;
  isActive: boolean;
}

type AnnouncementType = "info" | "success" | "warning" | "danger";
const ANNOUNCEMENT_TYPES: AnnouncementType[] = ["info", "success", "warning", "danger"];

const CONFIG_LABELS: Record<string, { label: string; description: string; icon: LucideIcon }> = {
  show_challenges: { label: "Tampilkan Tantangan", description: "Tampilkan/sembunyikan bagian Tantangan di dashboard.", icon: Trophy },
  show_leaderboard: { label: "Tampilkan Papan Peringkat", description: "Tampilkan/sembunyikan bagian Papan Peringkat di dashboard.", icon: Users },
  featured_module_slug: { label: "Modul Unggulan", description: "Slug modul yang ditampilkan sebagai sorotan di dashboard.", icon: BookOpen },
  announcement: { label: "Pengumuman", description: "Banner pengumuman di dashboard user.", icon: Megaphone },
};

function getBooleanValue(value: Record<string, unknown>, fallback: boolean) {
  return typeof value.enabled === "boolean" ? value.enabled : fallback;
}

function getStringValue(value: Record<string, unknown>, key: string) {
  return typeof value[key] === "string" ? value[key] : "";
}

function getAnnouncementType(value: unknown): AnnouncementType {
  return ANNOUNCEMENT_TYPES.includes(value as AnnouncementType) ? (value as AnnouncementType) : "info";
}

export default function AdminDashboardConfigPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showChallenges, setShowChallenges] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [featuredSlug, setFeaturedSlug] = useState("");
  const [featuredActive, setFeaturedActive] = useState(false);
  const [announcement, setAnnouncement] = useState<{ title: string; body: string; type: AnnouncementType }>({
    title: "", body: "", type: "info",
  });
  const [announcementActive, setAnnouncementActive] = useState(false);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetch("/api/admin/dashboard-config")
        .then(async (response) => {
          const payload = (await response.json().catch(() => null)) as { configs?: ConfigRow[]; error?: string } | null;
          if (!response.ok) throw new Error(payload?.error || "Gagal memuat konfigurasi dashboard.");
          return payload?.configs || [];
        })
        .then((data) => {
          for (const row of data) {
            if (row.key === "show_challenges") setShowChallenges(getBooleanValue(row.value, true));
            if (row.key === "show_leaderboard") setShowLeaderboard(getBooleanValue(row.value, true));
            if (row.key === "featured_module_slug") { setFeaturedSlug(getStringValue(row.value, "slug")); setFeaturedActive(row.isActive); }
            if (row.key === "announcement") {
              setAnnouncement({ title: getStringValue(row.value, "title"), body: getStringValue(row.value, "body"), type: getAnnouncementType(row.value.type) });
              setAnnouncementActive(row.isActive);
            }
          }
          setLoadError(null);
        })
        .catch((error: unknown) => { setLoadError(error instanceof Error ? error.message : "Gagal memuat konfigurasi."); })
        .finally(() => setLoading(false));
    }
  }, [authLoading, isAdmin]);

  const saveConfig = async (key: string, value: Record<string, unknown>, isActive: boolean) => {
    setSaving(key);
    try {
      const response = await fetch("/api/admin/dashboard-config", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, isActive }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || "Gagal menyimpan konfigurasi.");
      toast.success("Konfigurasi berhasil disimpan!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan konfigurasi.");
    } finally { setSaving(null); }
  };

  if (authLoading || loading) return <AdminSidebar><LoadingSpinner text="Memuat konfigurasi..." /></AdminSidebar>;
  if (!isAdmin) return null;

  return (
    <AdminSidebar>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-600 tracking-tight">
            Konfigurasi Dashboard
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Kontrol tampilan dan fitur dashboard pengguna secara real-time.
          </p>
        </div>

        {loadError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>
        )}

        <ConfigCard label={CONFIG_LABELS.show_challenges.label} description={CONFIG_LABELS.show_challenges.description} Icon={CONFIG_LABELS.show_challenges.icon}>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowChallenges(!showChallenges)} className="flex items-center gap-2 text-sm">
              {showChallenges ? <ToggleRight className="w-8 h-8 text-brand-500" /> : <ToggleLeft className="w-8 h-8 text-stone-300" />}
              <span className={showChallenges ? "text-brand-600 font-medium" : "text-stone-400"}>{showChallenges ? "Ditampilkan" : "Disembunyikan"}</span>
            </button>
            <SaveBtn saving={saving === "show_challenges"} onClick={() => saveConfig("show_challenges", { enabled: showChallenges }, true)} />
          </div>
        </ConfigCard>

        <ConfigCard label={CONFIG_LABELS.show_leaderboard.label} description={CONFIG_LABELS.show_leaderboard.description} Icon={CONFIG_LABELS.show_leaderboard.icon}>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="flex items-center gap-2 text-sm">
              {showLeaderboard ? <ToggleRight className="w-8 h-8 text-brand-500" /> : <ToggleLeft className="w-8 h-8 text-stone-300" />}
              <span className={showLeaderboard ? "text-brand-600 font-medium" : "text-stone-400"}>{showLeaderboard ? "Ditampilkan" : "Disembunyikan"}</span>
            </button>
            <SaveBtn saving={saving === "show_leaderboard"} onClick={() => saveConfig("show_leaderboard", { enabled: showLeaderboard }, true)} />
          </div>
        </ConfigCard>

        <ConfigCard label={CONFIG_LABELS.featured_module_slug.label} description={CONFIG_LABELS.featured_module_slug.description} Icon={CONFIG_LABELS.featured_module_slug.icon}>
          <div className="space-y-3">
            <input
              type="text" value={featuredSlug} onChange={(e) => setFeaturedSlug(e.target.value)}
              placeholder="contoh: mengenal-energi-panas-bumi"
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-charcoal-300 cursor-pointer">
                <input type="checkbox" checked={featuredActive} onChange={(e) => setFeaturedActive(e.target.checked)} className="w-4 h-4 accent-brand-600" />
                Aktifkan Modul Unggulan
              </label>
              <SaveBtn saving={saving === "featured_module_slug"} onClick={() => saveConfig("featured_module_slug", { slug: featuredSlug }, featuredActive && !!featuredSlug)} />
            </div>
          </div>
        </ConfigCard>

        <ConfigCard label={CONFIG_LABELS.announcement.label} description={CONFIG_LABELS.announcement.description} Icon={CONFIG_LABELS.announcement.icon}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1">Judul Pengumuman</label>
              <input type="text" value={announcement.title} onChange={(e) => setAnnouncement((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Pembaruan Sistem" maxLength={80}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1">Isi Pengumuman</label>
              <textarea value={announcement.body} onChange={(e) => setAnnouncement((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Tulis isi pengumuman di sini..." rows={3} maxLength={500}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-300 mb-1">Tipe</label>
              <select value={announcement.type} onChange={(e) => setAnnouncement((prev) => ({ ...prev, type: getAnnouncementType(e.target.value) }))}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="info">Info (Biru)</option>
                <option value="success">Sukses (Hijau)</option>
                <option value="warning">Peringatan (Kuning)</option>
                <option value="danger">Penting (Merah)</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-charcoal-300 cursor-pointer">
                <input type="checkbox" checked={announcementActive} onChange={(e) => setAnnouncementActive(e.target.checked)} className="w-4 h-4 accent-brand-600" />
                Tampilkan Pengumuman
              </label>
              <SaveBtn saving={saving === "announcement"} onClick={() => saveConfig("announcement", announcement as Record<string, unknown>, announcementActive && !!announcement.body)} />
            </div>
          </div>
        </ConfigCard>
      </div>
    </AdminSidebar>
  );
}

function ConfigCard({ label, description, Icon, children }: { label: string; description: string; Icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-100 shadow-card p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h3 className="font-bold text-charcoal-400 text-sm">{label}</h3>
          <p className="text-xs text-stone-400 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SaveBtn({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick} disabled={saving}
      className="flex items-center gap-1.5 text-sm bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white px-3 py-2 rounded-xl font-semibold transition-colors shrink-0"
    >
      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
      Simpan
    </button>
  );
}
