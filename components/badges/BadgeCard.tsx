"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import type { Badge, BadgeDB } from "@/types";

type BadgeCardBadge = Pick<Badge, "id" | "name" | "description" | "icon"> &
  Partial<Pick<Badge, "requirement">> &
  Partial<Pick<BadgeDB, "slug" | "category">>;

interface BadgeCardProps {
  badge: BadgeCardBadge;
  isUnlocked: boolean;
}

function canRenderWithNextImage(src: string) {
  if (src.startsWith("/")) return true;

  try {
    const host = new URL(src).hostname;
    return host.endsWith(".supabase.co") || host === "lh3.googleusercontent.com";
  } catch {
    return false;
  }
}

function BadgeIcon({ icon, name, locked }: { icon?: string | null; name: string; locked: boolean }) {
  const safeIcon = icon?.trim();

  if (safeIcon && canRenderWithNextImage(safeIcon)) {
    return (
      <Image
        src={safeIcon}
        alt=""
        width={56}
        height={56}
        className={`mx-auto h-14 w-14 object-contain ${locked ? "grayscale" : ""}`}
      />
    );
  }

  if (safeIcon && !safeIcon.startsWith("http")) {
    return <div className={`text-5xl ${locked ? "grayscale" : ""}`}>{safeIcon}</div>;
  }

  return (
    <div
      aria-label={name}
      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ${
        locked ? "grayscale" : ""
      }`}
    >
      <Award className="h-7 w-7" />
    </div>
  );
}

export default function BadgeCard({ badge, isUnlocked }: BadgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl border p-6 text-center transition-all ${
        isUnlocked
          ? "border-emerald-200 bg-white shadow-sm hover:shadow-md"
          : "border-slate-200 bg-slate-50 opacity-70"
      }`}
    >
      {!isUnlocked && (
        <div className="absolute right-3 top-3">
          <Lock className="h-4 w-4 text-slate-400" />
        </div>
      )}

      <div className="mb-4">
        <BadgeIcon icon={badge.icon} name={badge.name} locked={!isUnlocked} />
      </div>

      <h3
        className={`mb-2 font-semibold ${isUnlocked ? "text-slate-800" : "text-slate-500"}`}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {badge.name}
      </h3>

      <p className={`mb-3 text-sm ${isUnlocked ? "text-slate-500" : "text-slate-400"}`}>{badge.description}</p>

      <div
        className={`inline-block rounded-full px-3 py-1.5 text-xs font-medium ${
          isUnlocked ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
        }`}
      >
        {isUnlocked ? "Terbuka" : badge.requirement || "Belum terbuka"}
      </div>
    </motion.div>
  );
}
