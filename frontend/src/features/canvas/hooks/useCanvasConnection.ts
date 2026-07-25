import { useCallback } from 'react';
import { useCanvasInteractionStore } from '../stores/canvasInteraction.store';
import { InteractionMode } from '../types/InteractionMode';
import type { OnConnect } from '@/lib/reactflow';

interface UseCanvasConnectionOptions {
  onConnect: OnConnect;
}

interface UseCanvasConnectionReturn {
  onConnectStart: () => void;
  onConnectEnd: () => void;
  onConnect: OnConnect;
}

export function useCanvasConnection({ onConnect }: UseCanvasConnectionOptions): UseCanvasConnectionReturn {
  const setMode = useCanvasInteractionStore((s) => s.setMode);

  const onConnectStart = useCallback(() => {
    setMode(InteractionMode.Connecting);
  }, [setMode]);

  const onConnectEnd = useCallback(() => {
    setMode(InteractionMode.Idle);
  }, [setMode]);

  const handleConnect = useCallback<OnConnect>(
    (connection) => {
      onConnect(connection);
      setMode(InteractionMode.Idle);
    },
    [onConnect, setMode],
  );

  return { onConnectStart, onConnectEnd, onConnect: handleConnect };
}
