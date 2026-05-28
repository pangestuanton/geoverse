"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Loader2, User, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { setupProfileSchema, type SetupProfileFormData } from "@/lib/validations";
import toast from "react-hot-toast";

export default function SetupProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "1";
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SetupProfileFormData>({
    resolver: zodResolver(setupProfileSchema),
    defaultValues: { displayName: "" },
  });

  const displayNameValue = watch("displayName");

  useEffect(() => {
    // Jika user belum login → ke login
    if (!loading && !user) {
      router.replace("/login");
    }
    // Jika user sudah setup profil DAN bukan mode edit → ke dashboard
    if (!loading && user?.profileSetupDone && !isEditMode) {
      router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, loading, router, isEditMode]);

  const onSubmit = async (data: SetupProfileFormData) => {
    setServerError(null);

    if (!user) {
      setServerError("Sesi login tidak ditemukan. Silakan login ulang.");
      return;
    }

    const trimmedName = data.displayName.trim();

    const { error } = await supabase
      .from("users")
      .upsert(
        {
          uid: user.uid,
          email: user.email ?? "",
          name: user.googleName || trimmedName,
          display_name: trimmedName,
          photo_url: user.photoURL || "",
          profile_setup_done: true,
          role: "user",
          total_points: 0,
        },
        { onConflict: "uid" }
      );

    if (error) {
      console.error("Gagal simpan profil:", error);
      setServerError("Gagal menyimpan nama. Silakan coba lagi.");
      return;
    }

    // Refresh auth state agar displayName terupdate
    await refreshUser();

    setSaved(true);
    toast.success("Profil berhasil disimpan! Selamat datang di GeoVerse 🌿");

    setTimeout(() => {
      router.replace("/dashboard");
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user || (!isEditMode && user.profileSetupDone)) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-emerald-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              GeoVerse
            </span>
          </div>

          {/* Avatar */}
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-emerald-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
          )}

          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Satu Langkah Lagi! 🌿
          </h1>
          <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
            Pilih nama yang akan ditampilkan di dashboard, leaderboard, dan profil GeoVerse-mu.
          </p>

          {/* Success state */}
          {saved ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
              <p className="font-semibold text-emerald-700">Profil tersimpan! Mengarahkan...</p>
            </div>
          ) : (
            <form id="form-setup-profile" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Server error */}
              {serverError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Tampilan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="input-display-name"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    {...register("displayName")}
                    maxLength={30}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-400">
                    {errors.displayName ? (
                      <span className="text-red-500">{errors.displayName.message}</span>
                    ) : (
                      "3–30 karakter, aman dari script berbahaya"
                    )}
                  </span>
                  <span className={`text-xs ${(displayNameValue?.length ?? 0) > 28 ? "text-amber-500" : "text-slate-400"}`}>
                    {displayNameValue?.length ?? 0}/30
                  </span>
                </div>
              </div>

              {/* Info tentang nama Google */}
              {user.googleName && (
                <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Nama Google-mu:</span> {user.googleName}
                  <br />
                  Nama Google hanya digunakan sebagai fallback jika nama tampilan tidak diisi.
                </div>
              )}

              <button
                id="btn-save-profile"
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3.5 rounded-xl font-semibold text-sm transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Simpan & Lanjutkan
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
