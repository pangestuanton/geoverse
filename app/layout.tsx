import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import ToastProvider from "@/components/common/ToastProvider";
import GeoVerseChatbot from "@/components/GeoVerseChatbot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "GeoVerse — Platform Edukasi Lingkungan Digital",
  description:
    "GeoVerse membantu anak muda Ulubelu memahami energi panas bumi, mencatat aksi pilah sampah, dan membangun kebiasaan hijau.",
  icons: {
    icon: "/logo/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased`}>
        <AuthProvider>
          {children}
          <ToastProvider />
          <GeoVerseChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
