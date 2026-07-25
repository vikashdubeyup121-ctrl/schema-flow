import { memo, useCallback, useState, type ReactNode, type ChangeEvent, type KeyboardEvent } from 'react';
import { useNoteStore } from '@/features/note/stores/note.store';
import { REVIEW_STATE_COLORS } from '@/features/canvas/constants/canvas.constants';
import { PropertySection } from '../PropertySection/PropertySection';
import { PropertyRow } from '../PropertyRow/PropertyRow';

interface NoteInspectorProps {
  noteId: string;
}

export const NoteInspector = memo(function NoteInspector({ noteId }: NoteInspectorProps): ReactNode {
  const note = useNoteStore((s) => s.notes[noteId]);
  const updateNote = useNoteStore((s) => s.updateNote);

  const [contentValue, setContentValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleFocus = useCallback(() => {
    if (!note) return;
    setContentValue(note.content);
    setIsEditing(true);
  }, [note]);

  const handleBlur = useCallback(() => {
    if (!note) return;
    if (contentValue !== note.content) {
      updateNote(noteId, { content: contentValue });
    }
    setIsEditing(false);
  }, [note, contentValue, noteId, updateNote]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        if (note) setContentValue(note.content);
        setIsEditing(false);
        e.currentTarget.blur();
      }
    },
    [note],
  );

  if (!note) return null;

  const reviewColor = REVIEW_STATE_COLORS[note.reviewState];

  return (
    <div className="flex flex-col overflow-y-auto flex-1">
      <PropertySection title="Content">
        <PropertyRow label="Text">
          <textarea
            value={isEditing ? contentValue : note.content}
            onFocus={handleFocus}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContentValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            rows={6}
            placeholder="Note content..."
            className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none transition-colors resize-none"
          />
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Size" defaultOpen={false}>
        <PropertyRow label="Width">
          <span className="text-sm text-foreground">{note.width}px</span>
        </PropertyRow>
        <PropertyRow label="Height">
          <span className="text-sm text-foreground">{note.height}px</span>
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Review" defaultOpen={false}>
        <PropertyRow label="State">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: reviewColor }}
            />
            <span className="text-sm text-foreground capitalize">{note.reviewState}</span>
          </div>
        </PropertyRow>
      </PropertySection>
    </div>
  );
});
