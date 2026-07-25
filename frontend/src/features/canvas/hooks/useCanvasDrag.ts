import { useCallback, useRef } from 'react';
import { useCanvasInteractionStore } from '../stores/canvasInteraction.store';
import { exceedsDragThreshold } from '../services/drag.service';
import { CANVAS } from '../constants/canvas.constants';
import type { Point } from '@/shared/types/Geometry';

interface UseCanvasDragOptions {
  onDragCommit: (id: string, position: Point) => void;
}

interface UseCanvasDragReturn {
  onPointerDown: (e: PointerEvent, id: string, worldPosition: Point) => void;
  onPointerMove: (e: PointerEvent, worldPosition: Point) => void;
  onPointerUp: (e: PointerEvent, worldPosition: Point) => void;
}

export function useCanvasDrag({ onDragCommit }: UseCanvasDragOptions): UseCanvasDragReturn {
  const { startDrag, updateDrag, endDrag, dragSession } = useCanvasInteractionStore();
  const dragStartWorldRef = useRef<Point | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const originalPositionRef = useRef<Point | null>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent, id: string, worldPosition: Point) => {
      if (e.button !== 0) return;
      draggingIdRef.current = id;
      dragStartWorldRef.current = { x: e.clientX, y: e.clientY };
      originalPositionRef.current = worldPosition;
      startDrag([id], worldPosition);
    },
    [startDrag],
  );

  const onPointerMove = useCallback(
    (_e: PointerEvent, worldPosition: Point) => {
      if (!dragSession?.active) return;
      updateDrag(worldPosition);
    },
    [dragSession, updateDrag],
  );

  const onPointerUp = useCallback(
    (_e: PointerEvent, worldPosition: Point) => {
      if (!dragSession?.active || !draggingIdRef.current) return;

      const startScreen = dragStartWorldRef.current;
      const currentScreen = worldPosition;

      if (
        startScreen &&
        exceedsDragThreshold(startScreen, currentScreen, CANVAS.DRAG_THRESHOLD_PX)
      ) {
        onDragCommit(draggingIdRef.current, worldPosition);
      }

      endDrag();
      draggingIdRef.current = null;
      dragStartWorldRef.current = null;
      originalPositionRef.current = null;
    },
    [dragSession, endDrag, onDragCommit],
  );

  return { onPointerDown, onPointerMove, onPointerUp };
}
