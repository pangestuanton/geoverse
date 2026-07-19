"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import UserTable from "@/components/admin/UserTable";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { UserProfile } from "@/types";

export default function AdminUsersPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { users?: UserProfile[]; error?: string } | null;
        if (!response.ok) throw new Error(payload?.error || "Gagal memuat pengguna.");
        setUsers(payload?.users || []);
        setError(null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Gagal memuat pengguna."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && isAdmin) fetchUsers();
  }, [authLoading, isAdmin]);

  if (authLoading || loading) return <AdminSidebar><LoadingSpinner text="Memuat data pengguna..." /></AdminSidebar>;
  if (!isAdmin) return null;

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-600 tracking-tight">
              Kelola Pengguna
            </h1>
            <p className="text-stone-400 text-sm mt-1">{users.length} pengguna terdaftar</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
            />
          </div>
        </div>
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}
        <UserTable users={users} searchQuery={search} onUpdate={fetchUsers} />
      </div>
    </AdminSidebar>
  );
}
