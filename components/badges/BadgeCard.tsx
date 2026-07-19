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
        className={`mx-auto h-14 w-14 object-contain ${locked ? "opacity-40" : ""}`}
      />
    );
  }

  if (safeIcon && !safeIcon.startsWith("http")) {
    return <div className={`text-5xl ${locked ? "opacity-40" : ""}`}>{safeIcon}</div>;
  }

  return (
    <div
      aria-label={name}
      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl ${
        locked ? "bg-stone-100 text-stone-400" : "bg-brand-50 text-brand-500"
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
          ? "border-brand-200 bg-white shadow-card hover:shadow-card-hover"
          : "border-stone-200 bg-stone-50/70"
      }`}
    >
      {!isUnlocked && (
        <div className="absolute right-3 top-3">
          <Lock className="h-4 w-4 text-stone-300" />
        </div>
      )}

      <div className="mb-4">
        <BadgeIcon icon={badge.icon} name={badge.name} locked={!isUnlocked} />
      </div>

      <h3 className={`mb-2 font-bold text-sm ${isUnlocked ? "text-charcoal-500" : "text-stone-400"}`}>
        {badge.name}
      </h3>

      <p className={`mb-3 text-xs ${isUnlocked ? "text-stone-400" : "text-stone-300"}`}>
        {badge.description}
      </p>

      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
          isUnlocked
            ? "bg-brand-50 text-brand-600 border-brand-200"
            : "bg-stone-100 text-stone-400 border-stone-200"
        }`}
      >
        {isUnlocked ? "Terbuka" : badge.requirement || "Belum terbuka"}
      </span>
    </motion.div>
  );
}
