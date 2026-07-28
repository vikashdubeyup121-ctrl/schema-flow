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
  EyeIcon,
  EyeOffIcon,
  AutoLayoutIcon,
  ChevronDownIcon,
} from '@/shared/icons';

interface CanvasToolbarProps {
  onAddTable?: (() => void) | undefined;
  onAddNote?: (() => void) | undefined;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onPublish?: (() => void) | undefined;
  onShare?: (() => void) | undefined;
  onSave?: (() => void) | undefined;
  onAutoLayout?: ((direction: string) => void) | undefined;
  showOnlyChanges?: boolean;
  onToggleShowChanges?: () => void;
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
  onShare,
  onSave,
  onAutoLayout,
  showOnlyChanges,
  onToggleShowChanges,
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

      {onAddTable && (
        <ToolButton label="Add Table (T)" onClick={onAddTable}>
          <AddIcon size={16} />
        </ToolButton>
      )}

      {onAddNote && (
        <ToolButton label="Add Note (N)" onClick={onAddNote}>
          <NoteIcon size={16} />
        </ToolButton>
      )}

      <Divider />

      {onAutoLayout && (
        <div className="flex items-center mx-1 gap-1 border border-border rounded-md px-1 bg-surface-hover focus-within:ring-1 focus-within:ring-primary h-8">
          <AutoLayoutIcon size={14} className="text-muted-foreground ml-1" />
          <select 
            className="bg-transparent text-xs text-foreground font-medium outline-none appearance-none cursor-pointer pl-1 pr-2"
            title="Auto Layout Algorithm"
            onChange={(e) => {
              if (e.target.value) {
                onAutoLayout(e.target.value);
                e.target.value = ""; // Reset after selection so it acts like a button
              }
            }}
          >
            <option value="" disabled selected>Auto Layout...</option>
            <optgroup label="Dagre">
              <option value="dagre-LR">Left to Right</option>
              <option value="dagre-TB">Top to Bottom</option>
            </optgroup>
            <optgroup label="ELK">
              <option value="elk-LR">Left to Right</option>
              <option value="elk-TB">Top to Bottom</option>
            </optgroup>
          </select>
          <ChevronDownIcon size={14} className="text-muted-foreground pointer-events-none -ml-2 mr-1" />
        </div>
      )}

      <Divider />

      <ToolButton
        label={showOnlyChanges ? 'Show all entities' : 'Show only changes'}
        active={showOnlyChanges}
        onClick={() => onToggleShowChanges?.()}
      >
        {showOnlyChanges ? <EyeIcon size={16} /> : <EyeOffIcon size={16} />}
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

      {onShare && (
        <button
          onClick={onShare}
          className="ml-1 h-8 px-3 bg-secondary text-secondary-foreground border border-border text-xs font-semibold rounded-md hover:bg-surface-hover transition-colors shadow-sm"
        >
          Share
        </button>
      )}

      {onPublish && (
        <button
          onClick={onPublish}
          className="ml-1 h-8 px-3 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-sm"
        >
          Publish
        </button>
      )}

      {onSave && (
        <button
          onClick={onSave}
          className="ml-1 h-8 px-3 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          Save
        </button>
      )}
    </div>
  );
}
