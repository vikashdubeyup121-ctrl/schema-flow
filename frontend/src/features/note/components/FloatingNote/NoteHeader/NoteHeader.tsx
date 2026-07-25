import { memo, type ReactNode, type MouseEvent } from 'react';
import { IconButton } from '@/shared/components';
import { EditIcon } from '@/shared/icons';

interface NoteHeaderProps {
  isEditing: boolean;
  onEditClick: (e: MouseEvent) => void;
}

export const NoteHeader = memo(function NoteHeader({
  isEditing,
  onEditClick,
}: NoteHeaderProps): ReactNode {
  return (
    <div
      className="flex items-center justify-between px-2 shrink-0"
      style={{
        height: 28,
        borderBottom: '1px solid hsl(var(--border))',
        background: 'hsl(var(--surface))',
      }}
    >
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
        Note
      </span>
      {!isEditing && (
        <IconButton
          label="Edit note"
          onClick={onEditClick}
          className="opacity-0 group-hover/note:opacity-100 transition-all p-0.5"
        >
          <EditIcon size={12} />
        </IconButton>
      )}
    </div>
  );
});
