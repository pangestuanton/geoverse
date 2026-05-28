import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

// ===== Google OAuth =====
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined,
    },
  });
  if (error) throw error;
}

// ===== Email + Password =====
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Terjemahkan error Supabase ke bahasa Indonesia
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("Email atau password salah. Silakan coba lagi.");
    }
    if (error.message.includes("Email not confirmed")) {
      throw new Error("Email belum dikonfirmasi. Cek kotak masuk email Anda.");
    }
    throw new Error(error.message);
  }
}

export async function registerWithEmailPassword(
  email: string,
  password: string
): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined,
    },
  });
  if (error) {
    if (error.message.includes("already registered") || error.message.includes("User already registered")) {
      throw new Error(
        "Email ini sudah terdaftar. Silakan login atau gunakan email lain."
      );
    }
    throw new Error(error.message);
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?type=recovery`
      : undefined,
  });
  if (error) throw new Error(error.message);
}

// ===== Sign Out =====
export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ===== Auth State Change =====
export function onAuthChange(callback: (user: User | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => {
    subscription.unsubscribe();
  };
}

// ===== Role Check =====
export function isAdminEmail(email: string | null): boolean {
  if (!email) return false;
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  const adminList = adminEmails.split(",").map((e) => e.trim().toLowerCase());
  return adminList.includes(email.toLowerCase());
}
