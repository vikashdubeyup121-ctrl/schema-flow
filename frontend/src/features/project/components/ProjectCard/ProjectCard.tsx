import { useState, useRef, useCallback, type ReactNode, type KeyboardEvent } from 'react';
import { useClickOutside } from '@/shared/hooks';
import { ProjectIcon, MoreHorizontalIcon, EditIcon, DeleteIcon, ShareIcon } from '@/shared/icons';
import type { Project } from '../../types/Project';

interface ProjectCardProps {
  project: Project;
  diagramCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onShare: () => void;
}

export function ProjectCard({
  project,
  diagramCount,
  isSelected,
  onSelect,
  onRename,
  onDelete,
  onShare,
}: ProjectCardProps): ReactNode {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(project.name);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setMenuOpen(false));

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== project.name) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  }, [renameValue, project.name, onRename]);

  const handleRenameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') commitRename();
      if (e.key === 'Escape') {
        setRenameValue(project.name);
        setIsRenaming(false);
      }
      e.stopPropagation();
    },
    [commitRename, project.name],
  );

  return (
    <div
      className={`
        relative group flex flex-col gap-3 p-4 rounded-xl border cursor-pointer
        transition-all duration-150 hover:border-border/80 hover:shadow-md
        ${isSelected
          ? 'border-primary/50 bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:bg-card/80'
        }
      `}
      onClick={onSelect}
    >
      {/* Icon + Menu */}
      <div className="flex items-start justify-between">
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${isSelected ? 'bg-primary/10 text-primary' : 'bg-surface text-muted-foreground'}
          `}
        >
          <ProjectIcon size={20} />
        </div>

        {/* Context menu trigger */}
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            aria-label="Project options"
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
                  setRenameValue(project.name);
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
                  onShare();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
              >
                <ShareIcon size={14} />
                Share
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

      {/* Name */}
      {isRenaming ? (
        <input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleRenameKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-semibold text-foreground bg-background border border-ring rounded px-2 py-0.5 outline-none w-full"
          autoFocus
        />
      ) : (
        <div>
          <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {diagramCount} {diagramCount === 1 ? 'diagram' : 'diagrams'}
          </p>
        </div>
      )}
    </div>
  );
}
