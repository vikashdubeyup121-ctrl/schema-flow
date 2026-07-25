import { useEffect } from 'react';
import { useKeyboard } from '@/app/providers/KeyboardProvider';
import { useCanvasSelectionStore } from '../stores/canvasSelection.store';
import { useCanvasInteractionStore } from '../stores/canvasInteraction.store';

interface UseCanvasKeyboardOptions {
  onAddTable: () => void;
  onAddNote: () => void;
  onDeleteSelected: () => void;
  onFitView: () => void;
}

export function useCanvasKeyboard({
  onAddTable,
  onAddNote,
  onDeleteSelected,
  onFitView,
}: UseCanvasKeyboardOptions): void {
  const { register } = useKeyboard();
  const deselectAll = useCanvasSelectionStore((s) => s.deselectAll);
  const setTool = useCanvasInteractionStore((s) => s.setTool);

  useEffect(() => {
    const unregisterV = register('v', () => setTool('pointer'), 10);
    const unregisterH = register('h', () => setTool('hand'), 10);
    const unregisterT = register('t', onAddTable, 10);
    const unregisterN = register('n', onAddNote, 10);
    const unregisterEsc = register('escape', deselectAll, 10);
    const unregisterDel = register('delete', onDeleteSelected, 10);
    const unregisterBackspace = register('backspace', onDeleteSelected, 10);
    const unregisterFit = register('ctrl+shift+f', onFitView, 10);

    return () => {
      unregisterV();
      unregisterH();
      unregisterT();
      unregisterN();
      unregisterEsc();
      unregisterDel();
      unregisterBackspace();
      unregisterFit();
    };
  }, [register, setTool, deselectAll, onAddTable, onAddNote, onDeleteSelected, onFitView]);
}
