"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Leaf, BookOpen, Target, ArrowLeft, Menu, X, Shield, Award, Settings, type LucideIcon } from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

const adminLinks: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Ringkasan", href: "/admin", icon: LayoutDashboard },
  { label: "Pengguna", href: "/admin/users", icon: Users },
  { label: "Green Log", href: "/admin/green-logs", icon: Leaf },
  { label: "Modul", href: "/admin/modules", icon: BookOpen },
  { label: "Tantangan", href: "/admin/challenges", icon: Target },
  { label: "Badge", href: "/admin/badges", icon: Award },
  { label: "Konfigurasi", href: "/admin/dashboard-config", icon: Settings },
];

function AdminSidebarContent({
  pathname,
  unreadCount,
  onClose,
}: {
  pathname: string;
  unreadCount: number;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-emerald-100 px-5 py-5">
        <Link href="/admin" onClick={onClose} className="flex items-center gap-3 rounded-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 shadow-sm shadow-emerald-700/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="block text-lg font-bold text-emerald-900">GeoVerse</span>
            <span className="text-xs font-semibold text-emerald-600">Admin Dashboard</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Navigasi admin">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-emerald-700 text-white shadow-sm shadow-emerald-700/20"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{link.label}</span>
              {link.label === "Ringkasan" && unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-emerald-100 p-4">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:bg-emerald-50 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard User
        </Link>
      </div>
    </div>
  );
}

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount } = useAdminNotifications();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8fdf9] via-white to-emerald-50/40">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-emerald-100 bg-white/95 shadow-sm shadow-emerald-900/5 backdrop-blur lg:flex">
        <AdminSidebarContent pathname={pathname} unreadCount={unreadCount} onClose={() => setMobileOpen(false)} />
      </aside>

      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-emerald-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-emerald-900">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-xl p-2 text-slate-700 transition-colors hover:bg-emerald-50"
          aria-label="Buka navigasi admin"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-950 lg:hidden" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 z-50 w-72 max-w-[86vw] bg-white shadow-2xl lg:hidden">
              <AdminSidebarContent pathname={pathname} unreadCount={unreadCount} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="min-h-screen flex-1 lg:ml-72">
        <div className="pt-16 lg:pt-0">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
