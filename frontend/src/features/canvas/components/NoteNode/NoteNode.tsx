import { memo, useCallback, useState, type ReactNode, type MouseEvent, type KeyboardEvent } from 'react';
import { NodeResizer, type Node, type NodeProps } from '@/lib/reactflow';
import { Markdown } from '@/lib/markdown';
import type { NoteNodeData } from '../../types/CanvasNode';
import { useCanvasSelectionStore } from '../../stores/canvasSelection.store';
import { CANVAS, REVIEW_STATE_COLORS } from '../../constants/canvas.constants';
import { EditIcon } from '@/shared/icons';

type NoteNodeType = Node<NoteNodeData, 'note'>;
type NoteNodeProps = NodeProps<NoteNodeType>;

export const NoteNode = memo(function NoteNode({ data, selected }: NoteNodeProps): ReactNode {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.content);
  const selectNote = useCanvasSelectionStore((s) => s.selectNote);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      selectNote(data.noteId, e.metaKey || e.ctrlKey);
    },
    [data.noteId, selectNote],
  );

  const handleDoubleClick = useCallback(() => {
    setEditValue(data.content);
    setIsEditing(true);
  }, [data.content]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Dispatch content update through note feature store
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setEditValue(data.content);
      setIsEditing(false);
    }
    e.stopPropagation();
  }, [data.content]);

  const reviewState = data.reviewState;
  const reviewColor = REVIEW_STATE_COLORS[reviewState];
  const borderStyle =
    reviewState !== 'published'
      ? `2px solid ${reviewColor}`
      : selected
        ? '2px solid hsl(var(--selected))'
        : '1px solid hsl(var(--border))';

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="rounded-lg bg-card flex flex-col overflow-hidden cursor-pointer group/note nodrag"
      style={{
        border: borderStyle,
        minWidth: CANVAS.NOTE_MIN_WIDTH,
        minHeight: CANVAS.NOTE_MIN_HEIGHT,
        width: data.width,
        height: data.height,
        opacity: reviewState === 'deleted' ? 0.6 : 1,
      }}
    >
      <NodeResizer
        minWidth={CANVAS.NOTE_MIN_WIDTH}
        minHeight={CANVAS.NOTE_MIN_HEIGHT}
        maxWidth={CANVAS.NOTE_MAX_WIDTH}
        maxHeight={CANVAS.NOTE_MAX_HEIGHT}
        isVisible={selected}
        lineStyle={{ border: 'none' }}
        handleStyle={{
          width: 8,
          height: 8,
          backgroundColor: 'hsl(var(--selected))',
          borderRadius: 2,
          border: 'none',
        }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-2 shrink-0"
        style={{ height: 28, borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--surface))' }}
      >
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
          Note
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
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
        ) : (
          <div className="prose prose-sm prose-invert max-w-none text-foreground text-xs leading-relaxed">
            {data.content ? (
              <Markdown>{data.content}</Markdown>
            ) : (
              <span className="text-muted-foreground italic">
                Double-click to add a note...
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
