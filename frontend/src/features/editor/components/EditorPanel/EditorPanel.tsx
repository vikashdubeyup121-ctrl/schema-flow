import { memo, useEffect, useRef, useCallback, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { linter, type Diagnostic } from '@codemirror/lint';
import { StreamLanguage } from '@codemirror/language';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
// ─── Simple DSL Linter ─────────────────────────────────────────────────────────

const dslLinter = linter((view) => {
  const diagnostics: Diagnostic[] = [];
  const doc = view.state.doc;
  const lines = doc.toString().split('\n');

  let inTable = false;
  let inNote = false;

  const TABLE_OPEN_RE = /^\s*[Tt]able\s+(\w+)\s*\{/;
  const TABLE_CLOSE_RE = /^\s*\}/;
  const NOTE_OPEN_RE = /^\s*[Nn]ote\s+(?:"([^"]+)"|'([^']+)'|(\w+))\s*\{/;
  const NOTE_CLOSE_RE = /^\s*\}/;
  const REF_STATEMENT_RE = /^\s*[Rr]ef(?:\s+\w+)?\s*:\s*(\w+)\.(\w+)\s*([><-])\s*(\w+)\.(\w+)/;
  const COMMENT_RE = /^\s*\/\//;
  const COLUMN_RE = /^\s*(\w+)\s+(\w+)(?:\s*\[([^\]]*)\])?/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();
    if (!trimmed || COMMENT_RE.test(trimmed)) continue;

    const from = doc.line(i + 1).from;
    const to = doc.line(i + 1).to;

    if (TABLE_OPEN_RE.test(line)) {
      inTable = true;
      continue;
    }

    if (NOTE_OPEN_RE.test(line)) {
      inNote = true;
      continue;
    }

    if (TABLE_CLOSE_RE.test(line) || NOTE_CLOSE_RE.test(line)) {
      if (!inTable && !inNote) {
        diagnostics.push({
          from, to, severity: 'error', message: 'Unexpected closing brace without an open table or note',
        });
      }
      inTable = false;
      inNote = false;
      continue;
    }

    if (REF_STATEMENT_RE.test(line)) {
      continue;
    }

    if (inTable) {
      if (!COLUMN_RE.test(trimmed)) {
        diagnostics.push({
          from, to, severity: 'error', message: 'Invalid column definition format',
        });
      }
    } else if (inNote) {
      // notes can have any content
      continue;
    } else {
      diagnostics.push({
        from, to, severity: 'error', message: 'Expected Table, Note, or Ref definition',
      });
    }
  }

  return diagnostics;
});

// ─── Simple DSL Syntax Highlighter ─────────────────────────────────────────────

const dslLanguage = StreamLanguage.define<{}>({
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match(/^\/\/.*/)) return 'comment';
    if (stream.match(/^[Tt]able\b/)) return 'keyword';
    if (stream.match(/^[Nn]ote\b/)) return 'keyword';
    if (stream.match(/^[Rr]ef\b/)) return 'keyword';
    if (stream.match(/^(varchar|uuid|int|bigint|smallint|decimal|float|double|text|char|boolean|date|timestamp|timestamptz|json|jsonb|bytea|serial|bigserial)\b/i)) return 'type';
    if (stream.match(/^(pk|primary key|not null|unique|default)\b/i)) return 'modifier';
    if (stream.match(/^[{}<>\-\[\]\.,:]/)) return 'punctuation';
    if (stream.match(/^[a-zA-Z_]\w*/)) return 'variableName';
    if (stream.match(/^[0-9]+/)) return 'number';
    if (stream.match(/^`[^`]*`/)) return 'string';
    stream.next();
    return null;
  },
  languageData: {
    commentTokens: { line: '// ' }
  }
});

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
    outline: 'none !important',
  },
  '&.cm-focused': {
    outline: 'none !important',
  },
  '.cm-editor.cm-focused': {
    outline: 'none !important',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(59, 130, 246, 0.4) !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#3b82f6',
  },
});


interface EditorPanelProps {
  value: string;
  onChange: (value: string) => void;
  width: number;
  onWidthChange: (width: number) => void;
  onSave?: () => void;
  isReadOnly?: boolean;
}

export const EditorPanel = memo(function EditorPanel({ value, onChange, width, onWidthChange, onSave, isReadOnly = false }: EditorPanelProps): ReactNode {
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
        dslLinter,
        dslLanguage,
        EditorState.readOnly.of(isReadOnly),
        keymap.of([
          indentWithTab,
          {
            key: "Mod-s",
            run: () => {
              if (onSave) onSave();
              return true;
            }
          }
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isExternalUpdateRef.current) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.domEventHandlers({
          dblclick(e, view) {
            const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
            if (pos !== null) {
              const line = view.state.doc.lineAt(pos);
              const match = /^\s*[Tt]able\s+(\w+)\s*\{/.exec(line.text);
              if (match && match[1]) {
                window.dispatchEvent(new CustomEvent('canvas:scroll-to-table', { detail: match[1] }));
              }
              const noteMatch = /^\s*[Nn]ote\s+(?:"([^"]+)"|'([^']+)'|(\w+))\s*\{/.exec(line.text);
              if (noteMatch) {
                const title = noteMatch[1] || noteMatch[2] || noteMatch[3];
                if (title) {
                  window.dispatchEvent(new CustomEvent('canvas:scroll-to-note', { detail: title }));
                }
              }
            }
            return false;
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    const handleScrollToTable = (e: CustomEvent<string>) => {
      if (!viewRef.current) return;
      const v = viewRef.current;
      const doc = v.state.doc.toString();
      const regex = new RegExp(`^\\s*[Tt]able\\s+${e.detail}\\s*\\{`, 'm');
      const match = regex.exec(doc);
      if (match) {
        v.dispatch({
          selection: { anchor: match.index },
          effects: EditorView.scrollIntoView(match.index, { y: 'center' })
        });
      }
    };
    const handleScrollToNote = (e: CustomEvent<string>) => {
      if (!viewRef.current) return;
      const v = viewRef.current;
      const doc = v.state.doc.toString();
      // note title can be in quotes
      const regex = new RegExp(`^\\s*[Nn]ote\\s+(?:"${e.detail}"|'${e.detail}'|${e.detail})\\s*\\{`, 'm');
      const match = regex.exec(doc);
      if (match) {
        v.dispatch({
          selection: { anchor: match.index },
          effects: EditorView.scrollIntoView(match.index, { y: 'center' })
        });
      }
    };
    window.addEventListener('editor:scroll-to-table', handleScrollToTable as EventListener);
    window.addEventListener('editor:scroll-to-note', handleScrollToNote as EventListener);

    return () => {
      window.removeEventListener('editor:scroll-to-table', handleScrollToTable as EventListener);
      window.removeEventListener('editor:scroll-to-note', handleScrollToNote as EventListener);
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadOnly]);

  // Sync external value changes into the editor (without triggering onChange)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;

    isExternalUpdateRef.current = true;
    const selection = view.state.selection;
    const mainAnchor = selection.main.anchor;
    
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      selection: { anchor: Math.min(mainAnchor, value.length) }
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
      <div 
        ref={containerRef} 
        className="flex-1 overflow-hidden" 
        onKeyDown={(e) => {
          if (isReadOnly) {
            // Ignore navigation keys
            const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', 'Tab', 'Escape'];
            if (!navKeys.includes(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
              import('@/shared/stores/toast.store').then(m => m.Toast.warning('You only have view permissions for this diagram.'));
            }
          }
        }}
      />

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
});
