import { createContext, useContext, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { ReactFlowProvider, useReactFlow, type ReactFlowInstance } from '@/lib/reactflow';

interface CanvasContextValue {
  instance: ReactFlowInstance | null;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  center: () => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

function CanvasProviderInner({ children }: { children: ReactNode }): ReactNode {
  const rf = useReactFlow();
  const instanceRef = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    instanceRef.current = rf;
  }, [rf]);

  const zoomIn = useCallback(() => {
    instanceRef.current?.zoomIn();
  }, []);

  const zoomOut = useCallback(() => {
    instanceRef.current?.zoomOut();
  }, []);

  const fitView = useCallback(() => {
    instanceRef.current?.fitView({ duration: 300 });
  }, []);

  const center = useCallback(() => {
    instanceRef.current?.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
  }, []);

  const value: CanvasContextValue = {
    instance: rf,
    zoomIn,
    zoomOut,
    fitView,
    center,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

interface CanvasProviderProps {
  children: ReactNode;
}

export function CanvasProvider({ children }: CanvasProviderProps): ReactNode {
  return (
    <ReactFlowProvider>
      <CanvasProviderInner>{children}</CanvasProviderInner>
    </ReactFlowProvider>
  );
}

export function useCanvasContext(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return ctx;
}
