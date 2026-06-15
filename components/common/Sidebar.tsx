"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Leaf,
  Target,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/lib/auth";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

const sidebarLinks: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Belajar", href: "/learn", icon: BookOpen },
  { label: "Green Log", href: "/green-log", icon: Leaf },
  { label: "Tantangan", href: "/challenges", icon: Target },
  { label: "Badge", href: "/badges", icon: Award },
  { label: "Profil", href: "/profile", icon: User },
];

interface SidebarContentProps {
  pathname: string;
  user: ReturnType<typeof useAuth>["user"];
  isAdmin: boolean;
  unreadCount: number;
  onClose: () => void;
  onLogout: () => void;
}

function SidebarContent({ pathname, user, isAdmin, unreadCount, onClose, onLogout }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-emerald-100 px-5 py-5">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3 rounded-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-sm shadow-emerald-500/20">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="block text-xl font-bold text-emerald-900">GeoVerse</span>
            <span className="text-xs font-medium text-emerald-600">Eco learning hub</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Navigasi utama">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`));
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            onClick={onClose}
            className="mt-4 flex min-h-11 items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 transition-all hover:border-emerald-300 hover:bg-emerald-100"
          >
            <Shield className="h-5 w-5 shrink-0 text-emerald-600" />
            <span className="flex-1">Panel Admin</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        )}
      </nav>

      <div className="border-t border-emerald-100 p-4">
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-emerald-50/70 p-3">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border border-white object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-emerald-700">
                {(user.displayName || "P").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{user.displayName || "Pengguna"}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { unreadCount } = useAdminNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8fdf9] via-white to-emerald-50/40">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-emerald-100 bg-white/95 shadow-sm shadow-emerald-900/5 backdrop-blur lg:flex">
        <SidebarContent
          pathname={pathname}
          user={user}
          isAdmin={isAdmin}
          unreadCount={unreadCount}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-emerald-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-emerald-900">GeoVerse</span>
        </Link>
        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-xl p-2 text-slate-700 transition-colors hover:bg-emerald-50"
          aria-label="Buka navigasi"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[86vw] bg-white shadow-2xl lg:hidden"
            >
              <SidebarContent
                pathname={pathname}
                user={user}
                isAdmin={isAdmin}
                unreadCount={unreadCount}
                onClose={() => setMobileOpen(false)}
                onLogout={handleLogout}
              />
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
