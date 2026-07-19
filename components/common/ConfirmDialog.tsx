"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "default",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const confirmStyles = {
    danger: "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500",
    warning: "bg-earth-600 hover:bg-earth-700 focus-visible:ring-earth-500",
    default: "bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-500",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal-600/40 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white rounded-2xl shadow-elevated border border-stone-100 w-full max-w-md p-6 z-10"
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                variant === "danger" ? "bg-red-50" : variant === "warning" ? "bg-earth-50" : "bg-brand-50"
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  variant === "danger" ? "text-red-600" : variant === "warning" ? "text-earth-600" : "text-brand-600"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-charcoal-600">{title}</h3>
                <p className="text-sm text-stone-500 mt-1">{message}</p>
              </div>
              <button onClick={onCancel} className="p-1 rounded-lg hover:bg-stone-100 transition-colors" aria-label="Tutup">
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${confirmStyles[variant]}`}
              >
                {loading ? "Memproses..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
