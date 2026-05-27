"use client";

import { useState, useEffect, useContext, createContext, ReactNode } from "react";
import { onAuthChange, isAdminEmail } from "@/lib/auth";

interface AuthContextType {
  user: any;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((supabaseUser) => {
      if (supabaseUser) {
        // Map Supabase User properties to Firebase User properties for 100% backward compatibility
        const mappedUser = {
          ...supabaseUser,
          uid: supabaseUser.id,
          displayName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || "Pengguna GeoVerse",
          photoURL: supabaseUser.user_metadata?.avatar_url || "",
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const isAdmin = isAdminEmail(user?.email || null);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
