import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-5">
      <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center border border-brand-100 shadow-sm">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
      <p className="text-stone-400 text-sm font-medium">Menyiapkan konten ramah lingkungan...</p>
    </div>
  );
}
