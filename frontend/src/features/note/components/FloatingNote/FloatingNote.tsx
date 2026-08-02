import { memo, useCallback, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { useNoteStore } from '../../stores/note.store';
import { useCanvasSelectionStore } from '@/features/canvas/stores/canvasSelection.store';
import { CANVAS } from '@/features/canvas/constants/canvas.constants';
import { NoteHeader } from './NoteHeader';
import { NoteBody } from './NoteBody';
import type { FloatingNoteProps } from './FloatingNote.types';

export const FloatingNote = memo(function FloatingNote({ noteId }: FloatingNoteProps): ReactNode {
  const note = useNoteStore((s) => s.notes[noteId]);
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

  const handleDoubleClick = useCallback((e: MouseEvent) => {
    if (!note) return;
    e.stopPropagation();
    setEditValue(note.content);
    setIsEditing(true);
  }, [note]);

  const handleHeaderDoubleClick = useCallback((e: MouseEvent) => {
    if (!note) return;
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('editor:scroll-to-note', { detail: note.title }));
  }, [note]);

  const handleBlur = useCallback(() => {
    useNoteStore.getState().updateNote(noteId, { content: editValue });
    window.dispatchEvent(new CustomEvent('canvas:note-changed'));
    setIsEditing(false);
  }, [noteId, editValue]);

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

  const handleEditClick = useCallback(
    (e: MouseEvent) => {
      if (!note) return;
      e.stopPropagation();
      setEditValue(note.content);
      setIsEditing(true);
    },
    [note],
  );

  const handleColorPreview = useCallback((color: string) => {
    useNoteStore.getState().updateNote(noteId, { color });
  }, [noteId]);

  const handleColorSubmit = useCallback((color: string) => {
    useNoteStore.getState().updateNote(noteId, { color });
    window.dispatchEvent(new CustomEvent('canvas:change-note-color', {
      detail: { noteId, color }
    }));
  }, [noteId]);

  if (!note) return null;

  const borderStyle = isSelected
    ? '2px solid hsl(var(--selected))'
    : '1px solid hsl(var(--border))';

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="rounded-lg flex flex-col overflow-hidden cursor-pointer group/note"
      style={{
        backgroundColor: note.color ? `color-mix(in srgb, ${note.color} 10%, hsl(var(--card)))` : 'hsl(var(--card))',
        border: borderStyle,
        minWidth: CANVAS.NOTE_MIN_WIDTH,
        minHeight: CANVAS.NOTE_MIN_HEIGHT,
        width: note.width,
        height: note.height,
      }}
    >
      <NoteHeader 
        title={note.title} 
        color={note.color} 
        isEditing={isEditing} 
        onEditClick={handleEditClick} 
        onHeaderDoubleClick={handleHeaderDoubleClick}
        onColorPreview={handleColorPreview}
        onColorSubmit={handleColorSubmit}
      />
      <NoteBody
        content={note.content}
        isEditing={isEditing}
        editValue={editValue}
        onEditChange={setEditValue}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
});
