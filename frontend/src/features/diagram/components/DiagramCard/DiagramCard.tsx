import { useState, useRef, useCallback, type ReactNode, type KeyboardEvent } from 'react';
import { useClickOutside } from '@/shared/hooks';
import { DiagramIcon, MoreHorizontalIcon, EditIcon, DeleteIcon } from '@/shared/icons';
import type { Diagram } from '../../types/Diagram';

interface DiagramCardProps {
  diagram: Diagram;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export function DiagramCard({ diagram, onOpen, onRename, onDelete }: DiagramCardProps): ReactNode {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(diagram.name);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setMenuOpen(false));

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== diagram.name) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  }, [renameValue, diagram.name, onRename]);

  const handleRenameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') commitRename();
      if (e.key === 'Escape') {
        setRenameValue(diagram.name);
        setIsRenaming(false);
      }
      e.stopPropagation();
    },
    [commitRename, diagram.name],
  );

  const formatDate = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      className="relative group flex flex-col gap-3 p-4 rounded-xl border border-border bg-card hover:border-border/80 hover:shadow-md cursor-pointer transition-all duration-150 hover:bg-card/80"
      onClick={onOpen}
    >
      {/* Icon + Menu */}
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-muted-foreground">
          <DiagramIcon size={18} />
        </div>

        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            aria-label="Diagram options"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          >
            <MoreHorizontalIcon size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 w-36 bg-card border border-border rounded-lg shadow-xl py-1 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  setRenameValue(diagram.name);
                  setIsRenaming(true);
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
              >
                <EditIcon size={14} />
                Rename
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <DeleteIcon size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Name + Date */}
      {isRenaming ? (
        <input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleRenameKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-medium text-foreground bg-background border border-ring rounded px-2 py-0.5 outline-none w-full"
          autoFocus
        />
      ) : (
        <div>
          <p className="text-sm font-medium text-foreground truncate">{diagram.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Updated {formatDate(diagram.updatedAt)}
          </p>
        </div>
      )}
    </div>
  );
}
