/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useContext, createContext, ReactNode, useCallback } from "react";
import { onAuthChange, isAdminEmail } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string; // custom name (prioritas) atau Google name (fallback)
  googleName: string;  // nama dari Google account
  photoURL: string;
  role: UserRole;
  profileSetupDone: boolean;
  // raw supabase user
  raw: any;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (supabaseUser: any): Promise<AuthUser | null> => {
    if (!supabaseUser) return null;

    const googleName =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      "Pengguna GeoVerse";

    try {
      const { data: profile } = await supabase
        .from("users")
        .select("display_name, role, profile_setup_done")
        .eq("uid", supabaseUser.id)
        .maybeSingle();

      // Fallback role: cek email allowlist jika kolom role belum ada
      const dbRole: UserRole = profile?.role ?? (isAdminEmail(supabaseUser.email) ? "admin" : "user");

      return {
        uid: supabaseUser.id,
        email: supabaseUser.email ?? null,
        displayName: profile?.display_name || googleName,
        googleName,
        photoURL: supabaseUser.user_metadata?.avatar_url || "",
        role: dbRole,
        profileSetupDone: profile?.profile_setup_done ?? false,
        raw: supabaseUser,
      };
    } catch {
      // Gagal baca DB → fallback ke data minimal
      const fallbackRole: UserRole = isAdminEmail(supabaseUser.email) ? "admin" : "user";
      return {
        uid: supabaseUser.id,
        email: supabaseUser.email ?? null,
        displayName: googleName,
        googleName,
        photoURL: supabaseUser.user_metadata?.avatar_url || "",
        role: fallbackRole,
        profileSetupDone: false,
        raw: supabaseUser,
      };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    const mapped = await fetchUserProfile(supabaseUser);
    setUser(mapped);
  }, [fetchUserProfile]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (supabaseUser) => {
      if (supabaseUser) {
        const mapped = await fetchUserProfile(supabaseUser);
        setUser(mapped);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [fetchUserProfile]);

  const isAdmin = user?.role === "admin" || isAdminEmail(user?.email ?? null);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
