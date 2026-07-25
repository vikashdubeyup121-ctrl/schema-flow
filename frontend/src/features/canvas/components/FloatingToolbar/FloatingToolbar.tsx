import { memo, type ReactNode } from 'react';
import { DeleteIcon, CopyIcon, EditIcon } from '@/shared/icons';
import { IconButton } from '@/shared/components/IconButton';
import { useCanvasSelectionStore } from '../../stores/canvasSelection.store';

interface FloatingToolbarProps {
  onDelete: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
}

export const FloatingToolbar = memo(function FloatingToolbar({
  onDelete,
  onDuplicate,
  onCopy,
}: FloatingToolbarProps): ReactNode {
  const hasSelection = useCanvasSelectionStore((s) => s.hasSelection());

  if (!hasSelection) return null;

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg px-1 py-1 z-10"
      role="toolbar"
      aria-label="Selection actions"
    >
      <IconButton label="Duplicate" onClick={onDuplicate}>
        <EditIcon size={14} />
      </IconButton>
      <IconButton label="Copy" onClick={onCopy}>
        <CopyIcon size={14} />
      </IconButton>
      <div className="w-px h-4 bg-border mx-0.5" />
      <IconButton
        label="Delete"
        onClick={onDelete}
        className="hover:text-danger hover:bg-danger/10"
      >
        <DeleteIcon size={14} />
      </IconButton>
    </div>
  );
});
