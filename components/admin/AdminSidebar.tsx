"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Leaf, BookOpen, Target, ArrowLeft, Menu, X, Shield } from "lucide-react";

const adminLinks = [
  { label: "Ringkasan", href: "/admin", icon: LayoutDashboard },
  { label: "Pengguna", href: "/admin/users", icon: Users },
  { label: "Green Log", href: "/admin/green-logs", icon: Leaf },
  { label: "Modul", href: "/admin/modules", icon: BookOpen },
  { label: "Tantangan", href: "/admin/challenges", icon: Target },
];

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-emerald-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-emerald-800 block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              GeoVerse
            </span>
            <span className="text-xs text-emerald-600">Admin Dashboard</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-600"
              }`}
            >
              <link.icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : ""}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-100">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f8fdf9]">
      <aside className="hidden lg:flex w-64 bg-white border-r border-emerald-100 flex-col fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-emerald-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-700 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-emerald-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-emerald-50" aria-label="Toggle sidebar">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 bg-black z-40" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-xl">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-16 lg:pt-0">
          <div className="max-w-6xl mx-auto p-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
