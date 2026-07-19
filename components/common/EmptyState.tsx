import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center mb-5">
        {icon || <Inbox className="w-10 h-10 text-brand-400" />}
      </div>
      <h3 className="text-lg font-bold text-charcoal-500 mb-2">{title}</h3>
      <p className="text-sm text-stone-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
