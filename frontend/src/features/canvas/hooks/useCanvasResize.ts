import { useCallback } from 'react';
import { useCanvasInteractionStore } from '../stores/canvasInteraction.store';
import { computeResizeWidth } from '../services/resize.service';

interface UseCanvasResizeOptions {
  onResizeCommit: (tableId: string, width: number) => void;
}

interface UseCanvasResizeReturn {
  onResizeStart: (tableId: string, startWidth: number, startX: number) => void;
  onResizeMove: (currentX: number) => void;
  onResizeEnd: () => void;
}

export function useCanvasResize({ onResizeCommit }: UseCanvasResizeOptions): UseCanvasResizeReturn {
  const { startResize, updateResize, endResize, resizeSession } = useCanvasInteractionStore();

  const onResizeStart = useCallback(
    (tableId: string, startWidth: number, startX: number) => {
      startResize(tableId, startWidth, startX);
    },
    [startResize],
  );

  const onResizeMove = useCallback(
    (currentX: number) => {
      if (!resizeSession?.active) return;
      const { width } = computeResizeWidth(
        resizeSession.startWidth,
        resizeSession.startX,
        currentX,
        true,
      );
      updateResize(width);
    },
    [resizeSession, updateResize],
  );

  const onResizeEnd = useCallback(() => {
    if (!resizeSession?.active) return;
    onResizeCommit(resizeSession.tableId, resizeSession.currentWidth);
    endResize();
  }, [resizeSession, endResize, onResizeCommit]);

  return { onResizeStart, onResizeMove, onResizeEnd };
}
