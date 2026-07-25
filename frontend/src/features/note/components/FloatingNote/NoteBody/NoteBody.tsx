import { memo, type KeyboardEvent, type ReactNode } from 'react';
import { MarkdownPreview } from '@/shared/components';

interface NoteBodyProps {
  content: string;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onBlur: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const NoteBody = memo(function NoteBody({
  content,
  isEditing,
  editValue,
  onEditChange,
  onBlur,
  onKeyDown,
}: NoteBodyProps): ReactNode {
  return (
    <div className="flex-1 overflow-auto p-2">
      {isEditing ? (
        <textarea
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className="w-full h-full bg-transparent text-sm text-foreground resize-none border-none outline-none leading-relaxed"
          autoFocus
        />
      ) : content ? (
        <MarkdownPreview content={content} className="text-xs leading-relaxed" />
      ) : (
        <span className="text-muted-foreground italic text-xs">
          Double-click to add a note...
        </span>
      )}
    </div>
  );
});
