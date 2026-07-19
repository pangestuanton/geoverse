type StatusVariant = "success" | "warning" | "error" | "info" | "neutral" | "pending" | "approved" | "rejected";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  size?: "sm" | "md";
  className?: string;
}

const styles: Record<StatusVariant, string> = {
  success: "bg-leaf-50 text-leaf-600 border-leaf-200",
  warning: "bg-earth-50 text-earth-600 border-earth-200",
  error: "bg-red-50 text-red-600 border-red-200",
  info: "bg-sky-50 text-sky-600 border-sky-200",
  neutral: "bg-stone-100 text-stone-600 border-stone-200",
  pending: "bg-earth-50 text-earth-600 border-earth-200",
  approved: "bg-leaf-50 text-leaf-600 border-leaf-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

export default function StatusBadge({ children, variant = "neutral", size = "md", className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      } ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
