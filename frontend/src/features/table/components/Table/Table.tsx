import {
  memo,
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@/shared/icons';
import { useTableStore } from '../../stores/table.store';
import { useCanvasSelectionStore } from '@/features/canvas/stores/canvasSelection.store';
import { useCanvasHoverStore } from '@/features/canvas/stores/canvasHover.store';
import { REVIEW_STATE_COLORS } from '@/features/canvas/constants/canvas.constants';
import { ReviewIndicator } from '@/features/review';
import { ColumnList } from '@/features/column/components/ColumnList';
import { TABLE } from './Table.constants';
import type { TableProps } from './Table.types';

export const Table = memo(function Table({ tableId }: TableProps): ReactNode {
  const table = useTableStore((s) => s.tables[tableId]);
  const updateTable = useTableStore((s) => s.updateTable);
  const isSelected = useCanvasSelectionStore((s) => s.selectedTableIds.has(tableId));

  // Hover: track whether any table is hovered, and whether this table is the hovered one or connected
  const hoveredId = useCanvasHoverStore((s) => s.hoveredId);
  const isHovered = hoveredId === tableId;
  const isHoverActive = hoveredId !== null;
  const isConnected = useCanvasHoverStore((s) => s.highlightedTableIds.has(tableId));

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = useCallback(() => {
    if (!table) return;
    setEditValue(table.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [table]);

  const commitEdit = useCallback(() => {
    if (!table) return;
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== table.name) {
      updateTable(tableId, { name: trimmed });
    }
    setEditing(false);
  }, [editValue, table, tableId, updateTable]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!table) return;
      if (e.key === 'Enter') commitEdit();
      if (e.key === 'Escape') {
        setEditValue(table.name);
        setEditing(false);
      }
      e.stopPropagation();
    },
    [commitEdit, table],
  );

  const handleToggleCollapse = useCallback(
    (e: MouseEvent) => {
      if (!table) return;
      e.stopPropagation();
      updateTable(tableId, { collapsed: !table.collapsed });
    },
    [tableId, table, updateTable],
  );

  if (!table) return null;

  // Dim this table when hover is active and it's neither the hovered table nor a connected table
  const shouldDim = isHoverActive && !isHovered && !isConnected;
  const isDeleted = table.reviewState === 'deleted';

  const reviewBorderColor = REVIEW_STATE_COLORS[table.reviewState];
  const borderStyle =
    table.reviewState !== 'published' && table.reviewState !== 'unchanged'
      ? `2px solid ${reviewBorderColor}`
      : isSelected || isHovered
        ? '2px solid hsl(var(--selected))'
        : '1px solid hsl(var(--border))';

  const estimatedHeight =
    TABLE.HEADER_HEIGHT + (table.collapsed ? 0 : table.columnIds.length) * TABLE.ROW_HEIGHT;

  return (
    <div
      className="rounded-lg overflow-hidden bg-card"
      style={{
        border: borderStyle,
        minWidth: TABLE.MIN_WIDTH,
        minHeight: estimatedHeight,
        opacity: isDeleted ? 0.6 : shouldDim ? 0.35 : 1,
        transition: 'opacity 0.15s ease, border-color 0.15s ease',
        boxShadow: isSelected
          ? '0 0 0 1px hsl(var(--selected) / 0.3)'
          : '0 2px 8px hsl(var(--background) / 0.5)',
      }}
    >
      {/* Table Header */}
      <div
        className={`flex items-center gap-2 px-3 select-none ${isSelected ? 'ring-2 ring-inset ring-selected' : ''}`}
        style={{ height: TABLE.HEADER_HEIGHT, backgroundColor: table.color, borderBottom: '1px solid hsl(var(--border))' }}
      >
        {/* Table name */}
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm font-semibold text-white border-none outline-none focus:ring-1 focus:ring-white/50 rounded px-1 min-w-0 nodrag nopan"
            autoFocus
          />
        ) : (
          <span
            className="flex-1 text-sm font-semibold text-white truncate cursor-text"
            onDoubleClick={handleDoubleClick}
            title={table.name}
          >
            {table.name}
          </span>
        )}

        {/* Review badge */}
        <ReviewIndicator reviewState={table.reviewState} className="shrink-0 text-white" />

        {/* Collapse toggle */}
        <button
          onClick={handleToggleCollapse}
          aria-label={table.collapsed ? 'Expand table' : 'Collapse table'}
          className="text-white/80 hover:text-white transition-colors shrink-0 p-0.5 rounded nodrag"
        >
          {table.collapsed ? <ChevronRightIcon size={14} /> : <ChevronDownIcon size={14} />}
        </button>
      </div>

      {/* Column list */}
      {!table.collapsed && (
        <div className="flex flex-col">
          {table.columnIds.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground italic">
              No columns yet
            </div>
          ) : (
            <ColumnList tableId={tableId} />
          )}
        </div>
      )}
    </div>
  );
});
