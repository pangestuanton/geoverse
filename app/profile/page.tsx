"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Leaf, BookOpen, Award, LogOut, Edit2 } from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import BadgeCard from "@/components/badges/BadgeCard";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useGreenLogs } from "@/hooks/useGreenLogs";
import { signOutUser } from "@/lib/auth";
import { getEarnedBadgeCards } from "@/lib/badgeDisplay";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, progress, userBadges, loading: userLoading } = useUserData();
  const { logs, loading: logsLoading } = useGreenLogs();

  if (userLoading || logsLoading) return <Sidebar><LoadingSpinner text="Memuat profil..." /></Sidebar>;

  const completedModules = progress.filter((p) => p.completed).length;
  const displayName = user?.displayName || profile?.displayName || profile?.name || "Pengguna GeoVerse";
  const googleName = user?.googleName;
  const earnedBadges = getEarnedBadgeCards(userBadges);

  const handleLogout = async () => {
    await signOutUser();
    router.push("/");
  };

  return (
    <Sidebar>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-card border border-brand-100 text-center">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt=""
              width={88}
              height={88}
              className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-full mx-auto mb-4 border-4 border-brand-100 object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4 border-4 border-brand-100">
              <span className="text-3xl font-extrabold text-brand-500">{displayName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-charcoal-600 tracking-tight">{displayName}</h1>
          {googleName && googleName !== displayName && (
            <p className="text-xs text-stone-400 mt-0.5">Nama Google: {googleName}</p>
          )}
          <p className="text-sm text-stone-400 mt-1">{user?.email}</p>

          <Link
            href="/setup-profile?edit=1"
            className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 mt-3 font-medium transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            Ubah Nama Tampilan
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Star, color: "text-earth-500", bg: "bg-earth-50", value: profile?.totalPoints || 0, label: "Total Poin" },
            { icon: Leaf, color: "text-brand-500", bg: "bg-brand-50", value: logs.length, label: "Green Log" },
            { icon: BookOpen, color: "text-sky-500", bg: "bg-sky-50", value: completedModules, label: "Modul Selesai" },
            { icon: Award, color: "text-teal-500", bg: "bg-teal-50", value: earnedBadges.length, label: "Badge" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 text-center shadow-card border border-brand-100">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xl font-extrabold text-charcoal-600">{stat.value}</p>
              <p className="text-xs text-stone-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-charcoal-500">Badge yang Diperoleh</h2>
              <p className="text-xs text-stone-400 mt-1">
                Badge terbuka lewat aktivitas belajar atau aksi hijau.
              </p>
            </div>
            <Link href="/badges" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Lihat semua badge
            </Link>
          </div>

          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {earnedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} isUnlocked={true} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-8 text-center">
              <Award className="mx-auto mb-3 h-10 w-10 text-brand-300" />
              <p className="font-semibold text-charcoal-400">Belum ada badge terbuka</p>
              <p className="mt-1 text-sm text-stone-400">
                Selesaikan modul dan catatan Green Log untuk mulai mengumpulkan badge.
              </p>
              <Link
                href="/learn"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Mulai Belajar
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-200 hover:bg-red-50 text-red-600 py-3 rounded-xl font-semibold text-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </Sidebar>
  );
}
