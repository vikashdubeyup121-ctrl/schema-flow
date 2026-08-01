import { useState, useRef, useEffect, type ReactNode } from 'react';
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
import { Send } from 'lucide-react';

interface CanvasToolbarProps {
  onAddTable?: (() => void) | undefined;
  onAddNote?: (() => void) | undefined;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onPublish?: (() => void) | undefined;
  onAutoLayout?: ((direction: string) => void) | undefined;
  showOnlyChanges?: boolean;
  onToggleShowChanges?: () => void;
}

interface ToolButtonProps {
  label: string;
  active?: boolean | undefined;
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

function AutoLayoutDropdown({ onSelect }: { onSelect: (val: string) => void }): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  const handleSelect = (val: string, label: string) => {
    setSelected(label);
    setIsOpen(false);
    onSelect(val);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center mx-1 gap-1 border border-border rounded-md px-2 bg-surface-hover hover:bg-surface focus:outline-none focus:ring-1 focus:ring-primary h-8 transition-colors text-xs font-medium text-foreground"
        title="Auto Layout Algorithm"
      >
        <AutoLayoutIcon size={14} className="text-muted-foreground" />
        <span>{selected || "Auto Layout..."}</span>
        <ChevronDownIcon size={14} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-card border border-border rounded-md shadow-lg py-1 z-50 text-xs text-foreground font-medium">
          <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dagre</div>
          <button onClick={() => handleSelect('dagre-LR', 'Dagre (L→R)')} className="w-full text-left px-3 py-1.5 hover:bg-surface-hover text-foreground flex items-center justify-between">
            Left to Right {selected === 'Dagre (L→R)' && <span className="text-primary">✓</span>}
          </button>
          <button onClick={() => handleSelect('dagre-TB', 'Dagre (T→B)')} className="w-full text-left px-3 py-1.5 hover:bg-surface-hover text-foreground flex items-center justify-between">
            Top to Bottom {selected === 'Dagre (T→B)' && <span className="text-primary">✓</span>}
          </button>
          <div className="border-t border-border my-1" />
          <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ELK</div>
          <button onClick={() => handleSelect('elk-LR', 'ELK (L→R)')} className="w-full text-left px-3 py-1.5 hover:bg-surface-hover text-foreground flex items-center justify-between">
            Left to Right {selected === 'ELK (L→R)' && <span className="text-primary">✓</span>}
          </button>
          <button onClick={() => handleSelect('elk-TB', 'ELK (T→B)')} className="w-full text-left px-3 py-1.5 hover:bg-surface-hover text-foreground flex items-center justify-between">
            Top to Bottom {selected === 'ELK (T→B)' && <span className="text-primary">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
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
  onAutoLayout,
  showOnlyChanges,
  onToggleShowChanges,
}: CanvasToolbarProps): ReactNode {
  const { activeTool, setTool } = useCanvasInteractionStore();

  return (
    <div
      className="flex items-center h-10 gap-0.5 bg-card border border-border rounded-lg px-2 shadow-lg pointer-events-auto"
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
        <AutoLayoutDropdown onSelect={onAutoLayout} />
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

      {onPublish && (
        <button
          onClick={onPublish}
          className="flex items-center gap-1.5 ml-1 h-8 px-3 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Send size={14} />
          Publish
        </button>
      )}
    </div>
  );
}
