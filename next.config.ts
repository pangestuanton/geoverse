import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Meminimalkan double-render/double-fetching yang berat di development
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  // Mengabaikan file watcher di .next dan node_modules untuk menghentikan compile loop di Windows
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
        ],
        poll: false,
      };
    }
    return config;
  },
};

export default nextConfig;
