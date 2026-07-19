"use client";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { full: [120, 28], mark: [28, 28], wordmark: [90, 20] },
  md: { full: [160, 37], mark: [40, 40], wordmark: [130, 29] },
  lg: { full: [200, 47], mark: [52, 52], wordmark: [170, 38] },
};

export default function Logo({ variant = "full", size = "md", href = "/", className = "" }: LogoProps) {
  const [w, h] = sizeMap[size][variant];
  const src = `/logo/geoverse-${variant}.svg`;

  const img = (
    <Image
      src={src}
      alt="GeoVerse"
      width={w}
      height={h}
      className={className}
      priority={variant !== "wordmark"}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0" aria-label="GeoVerse Home">
        {img}
      </Link>
    );
  }

  return img;
}
