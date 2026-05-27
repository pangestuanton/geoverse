"use client";
import type { UserProfile } from "@/types";

interface UserTableProps {
  users: UserProfile[];
  searchQuery: string;
}

export default function UserTable({ users, searchQuery }: UserTableProps) {
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-400">Tidak ada pengguna ditemukan.</td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.uid} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
