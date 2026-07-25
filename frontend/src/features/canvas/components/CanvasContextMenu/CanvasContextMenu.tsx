import { useEffect, useRef, type ReactNode } from 'react';
import { useClickOutside } from '@/shared/hooks';
import { useCanvasContextMenuStore } from '../../stores/canvasContextMenu.store';
import { Z_INDEX } from '@/shared/constants';

interface MenuItemProps {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

function MenuItem({ label, onClick, danger = false, disabled = false }: MenuItemProps): ReactNode {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${
        disabled
          ? 'text-muted-foreground cursor-not-allowed'
          : danger
            ? 'text-danger hover:bg-danger/10'
            : 'text-foreground hover:bg-surface-hover'
      }`}
    >
      {label}
    </button>
  );
}

function Separator(): ReactNode {
  return <div className="my-1 h-px bg-border" />;
}

interface CanvasContextMenuProps {
  onAddTable: () => void;
  onAddNote: () => void;
  onDeleteTarget: (id: string) => void;
  onSelectAll: () => void;
  onFitView: () => void;
}

export function CanvasContextMenu({
  onAddTable,
  onAddNote,
  onDeleteTarget,
  onSelectAll,
  onFitView,
}: CanvasContextMenuProps): ReactNode {
  const { open, x, y, targetType, targetId, closeMenu } = useCanvasContextMenuStore();
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => {
    if (open) closeMenu();
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closeMenu]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="fixed bg-card border border-border rounded-lg shadow-xl py-1 min-w-44"
      style={{ left: x, top: y, zIndex: Z_INDEX.CONTEXT_MENU }}
    >
      {targetType === 'canvas' && (
        <>
          <MenuItem label="Add Table" onClick={() => { onAddTable(); closeMenu(); }} />
          <MenuItem label="Add Note" onClick={() => { onAddNote(); closeMenu(); }} />
          <Separator />
          <MenuItem label="Select All" onClick={() => { onSelectAll(); closeMenu(); }} />
          <MenuItem label="Fit View" onClick={() => { onFitView(); closeMenu(); }} />
        </>
      )}

      {targetType === 'table' && targetId && (
        <>
          <MenuItem label="Rename Table" onClick={closeMenu} />
          <MenuItem label="Duplicate Table" onClick={closeMenu} />
          <Separator />
          <MenuItem
            label="Delete Table"
            danger
            onClick={() => { onDeleteTarget(targetId); closeMenu(); }}
          />
        </>
      )}

      {targetType === 'relationship' && targetId && (
        <>
          <MenuItem
            label="Delete Relationship"
            danger
            onClick={() => { onDeleteTarget(targetId); closeMenu(); }}
          />
        </>
      )}

      {targetType === 'note' && targetId && (
        <>
          <MenuItem label="Edit Note" onClick={closeMenu} />
          <Separator />
          <MenuItem
            label="Delete Note"
            danger
            onClick={() => { onDeleteTarget(targetId); closeMenu(); }}
          />
        </>
      )}
    </div>
  );
}
