import { memo, type ReactNode } from 'react';

export const EmptySelection = memo(function EmptySelection(): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 text-center gap-2">
      <span className="text-muted-foreground text-sm">No selection</span>
      <span className="text-muted-foreground text-xs">
        Click a table, relationship, or note to inspect it.
      </span>
    </div>
  );
});
