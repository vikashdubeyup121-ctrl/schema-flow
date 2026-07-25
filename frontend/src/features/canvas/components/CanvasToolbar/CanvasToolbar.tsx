import { type ReactNode } from 'react';
import { useCanvasInteractionStore } from '../../stores/canvasInteraction.store';
import {
  MoveIcon,
  AddIcon,
  NoteIcon,
  ZoomInIcon,
  ZoomOutIcon,
  MaximizeIcon,
  SidebarIcon,
} from '@/shared/icons';

interface CanvasToolbarProps {
  onAddTable: () => void;
  onAddNote: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onPublish: () => void;
}

interface ToolButtonProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolButton({ label, active = false, onClick, children }: ToolButtonProps): ReactNode {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
      }`}
    >
      {children}
    </button>
  );
}

function Divider(): ReactNode {
  return <div className="w-px h-5 bg-border mx-1" />;
}

export function CanvasToolbar({
  onAddTable,
  onAddNote,
  onZoomIn,
  onZoomOut,
  onFitView,
  isSidebarOpen,
  onToggleSidebar,
  onPublish,
}: CanvasToolbarProps): ReactNode {
  const { activeTool, setTool } = useCanvasInteractionStore();

  return (
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-card border border-border rounded-lg px-2 py-1.5 shadow-lg"
      style={{ zIndex: 10 }}
    >
      {/* Sidebar toggle */}
      <ToolButton
        label={isSidebarOpen ? 'Hide editor (E)' : 'Show editor (E)'}
        active={isSidebarOpen}
        onClick={onToggleSidebar}
      >
        <SidebarIcon size={16} />
      </ToolButton>

      <Divider />

      <ToolButton
        label="Pointer (V)"
        active={activeTool === 'pointer'}
        onClick={() => setTool('pointer')}
      >
        <MoveIcon size={16} />
      </ToolButton>

      <Divider />

      <ToolButton label="Add Table (T)" onClick={onAddTable}>
        <AddIcon size={16} />
      </ToolButton>

      <ToolButton label="Add Note (N)" onClick={onAddNote}>
        <NoteIcon size={16} />
      </ToolButton>

      <Divider />

      <ToolButton label="Zoom In (Ctrl +)" onClick={onZoomIn}>
        <ZoomInIcon size={16} />
      </ToolButton>

      <ToolButton label="Zoom Out (Ctrl -)" onClick={onZoomOut}>
        <ZoomOutIcon size={16} />
      </ToolButton>

      <ToolButton label="Fit View (Ctrl Shift F)" onClick={onFitView}>
        <MaximizeIcon size={16} />
      </ToolButton>

      <Divider />

      <button
        onClick={onPublish}
        className="ml-1 h-8 px-3 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-sm"
      >
        Publish
      </button>
    </div>
  );
}
