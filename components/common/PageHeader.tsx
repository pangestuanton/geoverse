interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 ${className || ""}`}>
      <div>
        <h1 className="text-2xl font-bold text-charcoal-600 tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-stone-500 max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
