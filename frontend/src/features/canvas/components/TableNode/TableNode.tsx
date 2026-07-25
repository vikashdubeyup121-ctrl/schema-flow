import { memo, useCallback, type ReactNode, type MouseEvent } from 'react';
import { NodeResizer } from '@/lib/reactflow';
import type { TableNodeProps } from './TableNode.types';
import { TableHeader } from './TableHeader';
import { ColumnRow } from './ColumnRow';
import { useCanvasSelectionStore } from '../../stores/canvasSelection.store';
import { useCanvasHoverStore } from '../../stores/canvasHover.store';
import { CANVAS, REVIEW_STATE_COLORS } from '../../constants/canvas.constants';

export const TableNode = memo(function TableNode({ data, selected }: TableNodeProps): ReactNode {
  const selectTable = useCanvasSelectionStore((s) => s.selectTable);
  const isHovered = useCanvasHoverStore((s) => s.hoveredId === data.tableId);
  const highlightedTableIds = useCanvasHoverStore((s) => s.highlightedTableIds);

  const isConnectedHighlight = highlightedTableIds.has(data.tableId);
  const isDeleted = data.reviewState === 'deleted';

  const handleToggleCollapse = useCallback(() => {
    // Dispatch collapse action through the table feature store
    // Kept as a no-op placeholder until table store is implemented
  }, []);

  const handleNameChange = useCallback((_name: string) => {
    // Dispatch rename action through the table feature store
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      selectTable(data.tableId, e.metaKey || e.ctrlKey);
    },
    [data.tableId, selectTable],
  );

  const reviewBorderColor = REVIEW_STATE_COLORS[data.reviewState];
  const borderStyle =
    data.reviewState !== 'published'
      ? `2px solid ${reviewBorderColor}`
      : selected || isHovered
        ? '2px solid hsl(var(--selected))'
        : '1px solid hsl(var(--border))';

  const minColumnRows = data.collapsed ? 0 : data.columns.length;
  const estimatedHeight =
    CANVAS.TABLE_HEADER_HEIGHT + minColumnRows * CANVAS.TABLE_ROW_HEIGHT;

  return (
    <div
      onClick={handleClick}
      className="rounded-lg overflow-hidden bg-card cursor-pointer nodrag"
      style={{
        border: borderStyle,
        minWidth: CANVAS.TABLE_MIN_WIDTH,
        minHeight: estimatedHeight,
        opacity: isDeleted ? 0.6 : isConnectedHighlight ? 0.5 : 1,
        boxShadow: selected
          ? '0 0 0 1px hsl(var(--selected) / 0.3)'
          : '0 2px 8px hsl(var(--background) / 0.5)',
      }}
    >
      <NodeResizer
        minWidth={CANVAS.TABLE_MIN_WIDTH}
        maxWidth={CANVAS.TABLE_MAX_WIDTH}
        isVisible={selected}
        lineStyle={{ border: 'none' }}
        handleStyle={{
          width: 8,
          height: 8,
          backgroundColor: 'hsl(var(--selected))',
          borderRadius: 2,
          border: 'none',
        }}
      />

      <TableHeader
        name={data.name}
        color={data.color}
        collapsed={data.collapsed}
        reviewState={data.reviewState}
        isSelected={!!selected}
        isHovered={isHovered}
        onToggleCollapse={handleToggleCollapse}
        onNameChange={handleNameChange}
      />

      {!data.collapsed && (
        <div className="flex flex-col">
          {data.columns.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground italic">
              No columns yet
            </div>
          ) : (
            data.columns.map((column) => (
              <ColumnRow
                key={column.id}
                column={column}
                tableId={data.tableId}
                isHovered={isHovered}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
});
