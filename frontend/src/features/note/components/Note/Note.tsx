import {
  memo,
  useCallback,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { EditIcon } from '@/shared/icons';
import { MarkdownPreview } from '@/shared/components/MarkdownPreview';
import { useNoteStore } from '../../stores/note.store';
import { useCanvasSelectionStore } from '@/features/canvas/stores/canvasSelection.store';
import { CANVAS, REVIEW_STATE_COLORS } from '@/features/canvas/constants/canvas.constants';
import type { NoteProps } from './Note.types';

export const Note = memo(function Note({ noteId }: NoteProps): ReactNode {
  const note = useNoteStore((s) => s.notes[noteId]);
  const updateNote = useNoteStore((s) => s.updateNote);
  const isSelected = useCanvasSelectionStore((s) => s.selectedNoteIds.has(noteId));
  const selectNote = useCanvasSelectionStore((s) => s.selectNote);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleClick = useCallback(
    (e: MouseEvent) => {
      selectNote(noteId, e.metaKey || e.ctrlKey);
    },
    [noteId, selectNote],
  );

  const handleDoubleClick = useCallback(() => {
    if (!note) return;
    setEditValue(note.content);
    setIsEditing(true);
  }, [note]);

  const handleBlur = useCallback(() => {
    updateNote(noteId, { content: editValue });
    setIsEditing(false);
  }, [noteId, editValue, updateNote]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!note) return;
      if (e.key === 'Escape') {
        setEditValue(note.content);
        setIsEditing(false);
      }
      e.stopPropagation();
    },
    [note],
  );

  const handleEditButtonClick = useCallback(
    (e: MouseEvent) => {
      if (!note) return;
      e.stopPropagation();
      setEditValue(note.content);
      setIsEditing(true);
    },
    [note],
  );

  if (!note) return null;

  const reviewColor = REVIEW_STATE_COLORS[note.reviewState];
  const borderStyle =
    note.reviewState !== 'published'
      ? `2px solid ${reviewColor}`
      : isSelected
        ? '2px solid hsl(var(--selected))'
        : '1px solid hsl(var(--border))';

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="rounded-lg bg-card flex flex-col overflow-hidden cursor-pointer group/note"
      style={{
        border: borderStyle,
        minWidth: CANVAS.NOTE_MIN_WIDTH,
        minHeight: CANVAS.NOTE_MIN_HEIGHT,
        width: note.width,
        height: note.height,
        opacity: note.reviewState === 'deleted' ? 0.6 : 1,
      }}
    >
      {/* Header */}
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
        <button
          onClick={handleEditButtonClick}
          aria-label="Edit note"
          className="opacity-0 group-hover/note:opacity-100 text-muted-foreground hover:text-foreground transition-all"
        >
          <EditIcon size={12} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2">
        {isEditing ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent text-sm text-foreground resize-none border-none outline-none leading-relaxed"
            autoFocus
          />
        ) : note.content ? (
          <MarkdownPreview content={note.content} className="text-xs leading-relaxed" />
        ) : (
          <span className="text-muted-foreground italic text-xs">
            Double-click to add a note...
          </span>
        )}
      </div>
    </div>
  );
});
