"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import UserTable from "@/components/admin/UserTable";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getAllUsers } from "@/lib/firestore";
import type { UserProfile } from "@/types";

export default function AdminUsersPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    getAllUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchUsers();
    }
  }, [authLoading, isAdmin]);

  if (authLoading || loading) return <AdminSidebar><LoadingSpinner /></AdminSidebar>;
  if (!isAdmin) return null;

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Kelola Pengguna
            </h1>
            <p className="text-slate-500 text-sm mt-1">{users.length} pengguna terdaftar</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
            />
          </div>
        </div>
        <UserTable users={users} searchQuery={search} onUpdate={fetchUsers} />
      </div>
    </AdminSidebar>
  );
}
