import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fdf9] gap-4">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm animate-pulse">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="font-bold text-emerald-800 tracking-wide text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          GeoVerse
        </h3>
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          Menyiapkan konten ramah lingkungan...
        </p>
      </div>
    </div>
  );
}
