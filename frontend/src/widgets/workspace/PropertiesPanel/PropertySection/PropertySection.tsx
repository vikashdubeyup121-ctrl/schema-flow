import { memo, useState, type ReactNode } from 'react';
import { ChevronDownIcon } from '@/shared/icons';

interface PropertySectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export const PropertySection = memo(function PropertySection({
  title,
  children,
  defaultOpen = true,
}: PropertySectionProps): ReactNode {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-surface-hover transition-colors"
      >
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <ChevronDownIcon
          size={14}
          className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-3 flex flex-col gap-3">
          {children}
        </div>
      )}
    </div>
  );
});
