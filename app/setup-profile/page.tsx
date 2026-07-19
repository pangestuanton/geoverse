"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2, User, CheckCircle, AlertCircle } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { setupProfileSchema, type SetupProfileFormData } from "@/lib/validations";
import toast from "react-hot-toast";
import Logo from "@/components/common/Logo";

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
    control,
  } = useForm<SetupProfileFormData>({
    resolver: zodResolver(setupProfileSchema),
    defaultValues: { displayName: "" },
  });

  const displayNameValue = useWatch({ control, name: "displayName" });
  const charCount = displayNameValue?.length ?? 0;
  const progressPercent = Math.min((charCount / 30) * 100, 100);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
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
          role: user.role,
          total_points: 0,
        },
        { onConflict: "uid" }
      );

    if (error) {
      console.error("Gagal simpan profil:", error);
      setServerError("Gagal menyimpan nama. Silakan coba lagi.");
      return;
    }

    await refreshUser();
    setSaved(true);
    toast.success("Profil berhasil disimpan! Selamat datang di GeoVerse");

    setTimeout(() => {
      router.replace("/dashboard");
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!user || (!isEditMode && user.profileSetupDone)) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-background to-teal-50/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-elevated border border-brand-100 p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <Logo variant="full" size="md" />
          </div>

          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt=""
              width={64}
              height={64}
              className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-brand-100 object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4 border-4 border-brand-100">
              <User className="w-8 h-8 text-brand-500" />
            </div>
          )}

          <h1 className="text-2xl font-bold text-center text-charcoal-600 mb-2 tracking-tight">
            {isEditMode ? "Edit Profil" : "Satu Langkah Lagi!"}
          </h1>
          <p className="text-sm text-stone-400 text-center mb-6 leading-relaxed">
            {isEditMode
              ? "Perbarui nama tampilan yang akan muncul di dashboard dan leaderboard."
              : "Pilih nama yang akan ditampilkan di dashboard, leaderboard, dan profil GeoVerse-mu."}
          </p>

          {saved ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle className="w-14 h-14 text-leaf-500 animate-fade-in-scale" />
              <p className="font-semibold text-brand-700">Profil tersimpan! Mengarahkan ke dashboard...</p>
            </div>
          ) : (
            <form id="form-setup-profile" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-charcoal-300 mb-1.5">
                  Nama Tampilan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="input-display-name"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    {...register("displayName")}
                    maxLength={30}
                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-100 transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  {errors.displayName ? (
                    <span className="text-xs text-red-500">{errors.displayName.message}</span>
                  ) : (
                    <span className="text-xs text-stone-400">3-30 karakter, gunakan nama yang sopan</span>
                  )}
                  <span className={`text-xs font-medium ${charCount > 28 ? "text-earth-500" : "text-stone-400"}`}>
                    {charCount}/30
                  </span>
                </div>
                <div className="mt-2 w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {user.googleName && (
                <div className="bg-stone-50 rounded-xl px-4 py-3 text-xs text-stone-500">
                  <span className="font-medium text-charcoal-400">Nama Google-mu:</span> {user.googleName}
                  <br />
                  <span className="text-stone-400">Nama Google hanya digunakan sebagai fallback jika nama tampilan tidak diisi.</span>
                </div>
              )}

              <button
                id="btn-save-profile"
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
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

        <p className="text-xs text-stone-400 text-center mt-6 leading-relaxed px-4">
          Data digunakan hanya untuk mencatat progres belajar dan aksi lingkungan pengguna.
        </p>
      </div>
    </div>
  );
}
