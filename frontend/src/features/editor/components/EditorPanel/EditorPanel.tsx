import { useEffect, useRef, useCallback, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';

const SIDEBAR_MIN_WIDTH = 240;
const SIDEBAR_MAX_WIDTH = 600;

// Custom theme overrides to blend with the app
const appTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '13px',
    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'inherit',
  },
  '.cm-content': {
    padding: '12px 0',
    caretColor: 'hsl(var(--primary))',
  },
  '.cm-focused': {
    outline: 'none',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-gutters': {
    borderRight: '1px solid hsl(var(--border))',
    background: 'transparent',
    color: 'hsl(var(--muted-foreground))',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
  },
  '.cm-activeLine': {
    backgroundColor: 'hsl(var(--surface))',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'hsl(var(--primary) / 0.2) !important',
  },
  '.cm-cursor': {
    borderLeftColor: 'hsl(var(--primary))',
  },
});

interface EditorPanelProps {
  value: string;
  onChange: (value: string) => void;
  width: number;
  onWidthChange: (width: number) => void;
}

export function EditorPanel({ value, onChange, width, onWidthChange }: EditorPanelProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isExternalUpdateRef = useRef(false);

  // Initialize CodeMirror
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        oneDark,
        appTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isExternalUpdateRef.current) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes into the editor (without triggering onChange)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;

    isExternalUpdateRef.current = true;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
    isExternalUpdateRef.current = false;
  }, [value]);

  // ─── Resize handle drag ──────────────────────────────────────────────────────

  const handleResizeMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;

      const onMouseMove = (ev: globalThis.MouseEvent): void => {
        const delta = ev.clientX - startX;
        const next = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, startWidth + delta));
        onWidthChange(next);
      };

      const onMouseUp = (): void => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [width, onWidthChange],
  );

  return (
    <div
      className="relative flex flex-col h-full border-r border-border bg-[#282c34] shrink-0"
      style={{ width }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-[#21252b]">
        <span className="text-xs font-semibold text-[#abb2bf] uppercase tracking-wide">
          Schema Editor
        </span>
      </div>

      {/* Editor */}
      <div ref={containerRef} className="flex-1 overflow-hidden" />

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors group"
        aria-label="Resize editor"
      >
        <div className="absolute inset-y-0 right-0 w-4 -translate-x-1.5" />
      </div>
    </div>
  );
}
