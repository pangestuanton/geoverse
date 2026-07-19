"use client";
import { useState } from "react";
import Image from "next/image";
import type { UserProfile } from "@/types";
import toast from "react-hot-toast";
import { Edit2, Loader2, X } from "lucide-react";

interface UserTableProps {
  users: UserProfile[];
  searchQuery: string;
  onUpdate?: () => void;
}

export default function UserTable({ users, searchQuery, onUpdate }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editPoints, setEditPoints] = useState(0);
  const [saving, setSaving] = useState(false);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPoints(user.totalPoints);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: editingUser.uid,
          name: editName,
          totalPoints: Number(editPoints),
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Gagal memperbarui profil pengguna.");
      }

      toast.success("Profil pengguna berhasil diperbarui.");
      setEditingUser(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui profil pengguna.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-emerald-50 border-b border-emerald-100">
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Nama</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Email</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Total Poin</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Bergabung</th>
              <th className="text-center px-6 py-3 font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">Tidak ada pengguna ditemukan.</td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.uid} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt=""
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold">{user.totalPoints}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {user.createdAt instanceof Date ? user.createdAt.toLocaleDateString("id-ID") : "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-brand-700 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all hover:shadow-sm"
                    >
                      <Edit2 className="w-3 h-3" />
                      Ubah
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-emerald-100 shadow-xl animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Edit Profil Pengguna
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">NAMA PENGGUNA</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">TOTAL POIN</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editPoints}
                  onChange={(e) => setEditPoints(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
