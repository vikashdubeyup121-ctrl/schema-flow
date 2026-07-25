import { memo, useCallback, useRef, useState, type ReactNode, type KeyboardEvent } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@/shared/icons';
import type { TableHeaderProps } from './TableNode.types';
import { REVIEW_STATE_COLORS } from '../../constants/canvas.constants';

const REVIEW_LABELS: Record<string, string> = {
  created: 'New',
  modified: 'Modified',
  deleted: 'Deleted',
};

export const TableHeader = memo(function TableHeader({
  name,
  color,
  collapsed,
  reviewState,
  isSelected,
  onToggleCollapse,
  onNameChange,
}: TableHeaderProps): ReactNode {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = useCallback(() => {
    setEditValue(name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [name]);

  const commitEdit = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== name) {
      onNameChange(trimmed);
    }
    setEditing(false);
  }, [editValue, name, onNameChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') commitEdit();
      if (e.key === 'Escape') {
        setEditValue(name);
        setEditing(false);
      }
      e.stopPropagation();
    },
    [commitEdit, name],
  );

  const reviewColor = REVIEW_STATE_COLORS[reviewState];
  const showBadge = reviewState !== 'published';

  return (
    <div
      className={`flex items-center gap-2 px-2 select-none ${isSelected ? 'ring-2 ring-inset ring-selected' : ''}`}
      style={{ height: 40, borderBottom: '1px solid hsl(var(--border))' }}
    >
      {/* Color accent */}
      <div
        className="w-2.5 h-2.5 rounded-sm shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Table name */}
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm font-semibold text-foreground border-none outline-none focus:ring-1 focus:ring-ring rounded px-1 min-w-0"
          autoFocus
        />
      ) : (
        <span
          className="flex-1 text-sm font-semibold text-foreground truncate cursor-text"
          onDoubleClick={handleDoubleClick}
          title={name}
        >
          {name}
        </span>
      )}

      {/* Review badge */}
      {showBadge && (
        <span
          className="text-[10px] font-bold px-1 py-0.5 rounded uppercase leading-none shrink-0"
          style={{ color: reviewColor, backgroundColor: `${reviewColor}20` }}
        >
          {REVIEW_LABELS[reviewState] ?? reviewState}
        </span>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand table' : 'Collapse table'}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-0.5 rounded"
      >
        {collapsed ? <ChevronRightIcon size={14} /> : <ChevronDownIcon size={14} />}
      </button>
    </div>
  );
});
