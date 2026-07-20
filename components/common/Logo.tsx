"use client";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const dims = {
  sm: { full: { w: 120, h: 28 }, mark: { w: 28, h: 28 }, wordmark: { w: 90, h: 20 } },
  md: { full: { w: 160, h: 37 }, mark: { w: 40, h: 40 }, wordmark: { w: 130, h: 29 } },
  lg: { full: { w: 200, h: 47 }, mark: { w: 52, h: 52 }, wordmark: { w: 170, h: 38 } },
};

const gradId = (variant: string) => `gv-grad-${variant}`;
const sgradId = (variant: string) => `gv-steam-${variant}`;

function LogoMark({ variant }: { variant: string }) {
  const suffix = variant === "full" ? "F" : "M";
  return (
    <>
      <defs>
        <linearGradient id={gradId(suffix)} x1="0" y1="0" x2="28" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id={sgradId(suffix)} x1="0" y1="56" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="26" fill={`url(#${gradId(suffix)})`} />
      <path d="M8 32 Q18 24 28 28 Q38 32 48 26" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
      <path d="M6 38 Q18 30 28 34 Q38 38 50 32" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
      <path d="M22 48 Q26 42 24 36 Q22 30 26 24" stroke={`url(#${sgradId(suffix)})`} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M30 48 Q34 42 32 36 Q30 30 34 24" stroke={`url(#${sgradId(suffix)})`} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M40 22 L44 18 L48 22 L44 20 Z" fill="#fcd34d" opacity="0.9" />
      <circle cx="44" cy="16" r="2" fill="#fde68a" opacity="0.6" />
      <path d="M2 44 Q14 40 28 42 Q42 44 54 40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
}

function LogoWordmark() {
  return (
    <>
      <text x="0" y="24" fontFamily="var(--font-plus-jakarta), 'Plus Jakarta Sans', Inter, system-ui, sans-serif" fontWeight="800" fontSize="22" fill="#064e3b" letterSpacing="-0.5">GeoVerse</text>
      <text x="1" y="36" fontFamily="var(--font-inter), Inter, system-ui, sans-serif" fontWeight="500" fontSize="10" fill="#0d9488" letterSpacing="2.5">ECO-TECH EDUCATION</text>
    </>
  );
}

export default function Logo({ variant = "full", size = "md", href = "/", className = "" }: LogoProps) {
  const { w, h } = dims[size][variant];
  const viewBox = variant === "full"
    ? "0 0 240 56"
    : variant === "mark"
    ? "0 0 56 56"
    : "0 0 180 40";

  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      width={w}
      height={h}
      className={className}
      aria-label="GeoVerse"
      role="img"
    >
      {(variant === "full" || variant === "mark") && <LogoMark variant={variant} />}
      {(variant === "full" || variant === "wordmark") && (
        <g transform={variant === "full" ? "translate(62, 0)" : undefined}>
          <LogoWordmark />
        </g>
      )}
    </svg>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0" aria-label="GeoVerse Home">
        {svg}
      </Link>
    );
  }

  return svg;
}
