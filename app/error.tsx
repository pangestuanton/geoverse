"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f8fdf9]">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-12">
        <div className="w-full rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Terjadi kesalahan saat memuat halaman
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Halaman gagal dirender dari server. Silakan muat ulang atau kembali ke beranda.
          </p>

          {error.digest && (
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-left font-mono text-xs text-slate-500">
              Digest: {error.digest}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              <RefreshCcw className="h-4 w-4" />
              Coba lagi
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
