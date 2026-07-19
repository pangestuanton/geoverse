import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ text = "Memuat..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      <p className="text-sm text-stone-400 font-medium">{text}</p>
    </div>
  );
}
