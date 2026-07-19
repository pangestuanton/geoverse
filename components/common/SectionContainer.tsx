interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "white" | "muted" | "brand" | "gradient";
}

const bgMap = {
  white: "bg-white",
  muted: "bg-surface-secondary",
  brand: "bg-brand-50",
  gradient: "bg-gradient-to-br from-brand-50 via-white to-teal-50/30",
};

export default function SectionContainer({ children, className = "", id, background = "white" }: SectionContainerProps) {
  return (
    <section id={id} className={`py-16 sm:py-20 lg:py-24 ${bgMap[background]}`}>
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
      </div>
    </section>
  );
}
