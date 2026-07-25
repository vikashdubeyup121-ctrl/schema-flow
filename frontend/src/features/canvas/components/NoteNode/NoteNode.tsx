import { memo, type ReactNode } from 'react';
import { NodeResizer, type Node, type NodeProps } from '@/lib/reactflow';
import { FloatingNote } from '@/features/note/components/FloatingNote';
import type { NoteNodeData } from '../../types/CanvasNode';
import { CANVAS } from '../../constants/canvas.constants';

type NoteNodeType = Node<NoteNodeData, 'note'>;
type NoteNodeProps = NodeProps<NoteNodeType>;

export const NoteNode = memo(function NoteNode({ data, selected }: NoteNodeProps): ReactNode {
  return (
    <>
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
      <FloatingNote noteId={data.noteId} />
    </>
  );
});
