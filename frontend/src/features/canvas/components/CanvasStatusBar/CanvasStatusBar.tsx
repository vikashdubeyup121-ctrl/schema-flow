import type { ReactNode } from 'react';
import { useCanvasViewportStore } from '../../stores/canvasViewport.store';
import type { AutosaveStatus } from '../../hooks/useCanvasAutosave';

interface CanvasStatusBarProps {
  nodeCount: number;
  autosaveStatus: AutosaveStatus;
  lastSavedAt: Date | null;
}

function AutosaveIndicator({
  status,
  lastSavedAt,
}: {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
}): ReactNode {
  if (status === 'saving') {
    return <span className="text-muted-foreground text-xs animate-pulse">Saving...</span>;
  }
  if (status === 'error') {
    return <span className="text-danger text-xs">Save failed — will retry</span>;
  }
  if (status === 'saved' && lastSavedAt) {
    return (
      <span className="text-muted-foreground text-xs">
        Saved {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    );
  }
  return null;
}

export function CanvasStatusBar({
  nodeCount,
  autosaveStatus,
  lastSavedAt,
}: CanvasStatusBarProps): ReactNode {
  const zoom = useCanvasViewportStore((s) => s.viewport.zoom);

  return (
    <div
      className="absolute bottom-3 left-3 flex items-center gap-4 bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground"
      style={{ zIndex: 10 }}
    >
      <span>{Math.round(zoom * 100)}%</span>
      <span>{nodeCount} {nodeCount === 1 ? 'table' : 'tables'}</span>
      <AutosaveIndicator status={autosaveStatus} lastSavedAt={lastSavedAt} />
    </div>
  );
}
