import { useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import { useCanvasContextMenuStore } from '../stores/canvasContextMenu.store';
import type { CanvasTargetType } from '../types/Canvas';

type AnyMouseEvent = ReactMouseEvent | globalThis.MouseEvent;

interface UseCanvasContextMenuReturn {
  openMenu: (e: AnyMouseEvent, targetType: CanvasTargetType, targetId?: string) => void;
  closeMenu: () => void;
}

export function useCanvasContextMenu(): UseCanvasContextMenuReturn {
  const { openMenu: storeOpen, closeMenu } = useCanvasContextMenuStore();

  const openMenu = useCallback(
    (e: AnyMouseEvent, targetType: CanvasTargetType, targetId?: string) => {
      e.preventDefault();
      e.stopPropagation();
      storeOpen(e.clientX, e.clientY, targetType, targetId);
    },
    [storeOpen],
  );

  return { openMenu, closeMenu };
}
