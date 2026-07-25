import { memo, type ReactNode } from 'react';

interface PropertyRowProps {
  label: string;
  children: ReactNode;
}

export const PropertyRow = memo(function PropertyRow({ label, children }: PropertyRowProps): ReactNode {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
});
