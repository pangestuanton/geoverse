import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ text = "Memuat..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      <p className="text-slate-500 font-medium">{text}</p>
    </div>
  );
}
