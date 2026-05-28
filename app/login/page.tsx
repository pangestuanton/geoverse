"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Loader2, Eye, EyeOff, Mail, Lock, UserPlus, LogIn, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle, signInWithEmailPassword, registerWithEmailPassword } from "@/lib/auth";
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/lib/validations";
import toast from "react-hot-toast";

type Mode = "login" | "register";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const errorParam = searchParams.get("error");
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace(redirectTo);
      }
    }
  }, [user, loading, router, redirectTo]);

  useEffect(() => {
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setServerError(null);
    try {
      await signInWithGoogle();
      // Redirect handled by OAuth callback
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal masuk dengan Google. Coba ulangi beberapa saat lagi.");
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await signInWithEmailPassword(data.email, data.password);
      // onAuthChange akan memicu redirect melalui useEffect
    } catch (error: any) {
      setServerError(error.message || "Gagal masuk. Coba lagi.");
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerWithEmailPassword(data.email, data.password);
      setRegisterSuccess(true);
    } catch (error: any) {
      setServerError(error.message || "Gagal mendaftar. Coba lagi.");
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setServerError(null);
    setRegisterSuccess(false);
    loginForm.reset();
    registerForm.reset();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-white px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-emerald-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              GeoVerse
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {mode === "login" ? "Masuk ke GeoVerse" : "Daftar GeoVerse"}
          </h1>
          <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
            {mode === "login"
              ? "Selamat datang kembali! Masuk untuk lanjutkan aksi hijau."
              : "Bergabunglah dan mulai perjalanan aksi hijau bersama kami."}
          </p>

          {/* Google Sign In */}
          <button
            id="btn-google-login"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 py-3.5 px-6 rounded-xl font-semibold text-sm text-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-5"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? "Memproses..." : "Lanjutkan dengan Google"}
          </button>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-400">atau dengan email</span>
            </div>
          </div>

          {/* Server Error */}
          {serverError && (
            <div id="auth-error" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Register Success */}
          {registerSuccess && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4">
              <span>✅ Pendaftaran berhasil! Cek email Anda untuk konfirmasi akun, lalu masuk.</span>
            </div>
          )}

          {/* Login Form */}
          {mode === "login" && !registerSuccess && (
            <form id="form-email-login" onSubmit={loginForm.handleSubmit(handleEmailLogin)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="input-login-email"
                    type="email"
                    placeholder="email@contoh.com"
                    {...loginForm.register("email")}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="input-login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    {...loginForm.register("password")}
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3.5 rounded-xl font-semibold text-sm transition-all"
              >
                {loginForm.formState.isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {loginForm.formState.isSubmitting ? "Memproses..." : "Masuk"}
              </button>

              <button
                type="button"
                onClick={() => switchMode("register")}
                className="w-full text-sm text-slate-600 hover:text-emerald-600 transition-colors py-2"
              >
                Belum punya akun? <span className="font-semibold text-emerald-600">Daftar sekarang</span>
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && !registerSuccess && (
            <form id="form-email-register" onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="input-register-email"
                    type="email"
                    placeholder="email@contoh.com"
                    {...registerForm.register("email")}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="input-register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 karakter (huruf + angka)"
                    {...registerForm.register("password")}
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="input-register-confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Ulangi password"
                    {...registerForm.register("confirmPassword")}
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3.5 rounded-xl font-semibold text-sm transition-all"
              >
                {registerForm.formState.isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {registerForm.formState.isSubmitting ? "Memproses..." : "Daftar Sekarang"}
              </button>

              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full text-sm text-slate-600 hover:text-emerald-600 transition-colors py-2"
              >
                Sudah punya akun? <span className="font-semibold text-emerald-600">Masuk</span>
              </button>
            </form>
          )}

          {/* Back to login after success */}
          {registerSuccess && (
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-all"
            >
              Masuk Sekarang
            </button>
          )}

          {/* Privacy Note */}
          <p className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
            Data digunakan hanya untuk mencatat progres belajar dan aksi lingkungan pengguna.
          </p>
        </div>
      </div>
    </div>
  );
}
