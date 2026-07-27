import { memo, type ReactNode } from 'react';
import { Handle, Position } from '@/lib/reactflow';
import { useColumnStore } from '../../stores/column.store';
import { REVIEW_STATE_COLORS } from '@/features/canvas/constants/canvas.constants';
import { NoteIcon } from '@/shared/icons';
import { PopoverTooltip } from '@/shared/components/Tooltip/PopoverTooltip';

interface ColumnRowProps {
  columnId: string;
}

function KeyBadge({ isPrimary, isForeign }: { isPrimary: boolean; isForeign: boolean }): ReactNode {
  if (isPrimary) {
    return (
      <span className="text-[10px] font-bold text-yellow-400 uppercase leading-none" title="Primary Key">
        PK
      </span>
    );
  }
  if (isForeign) {
    return (
      <span className="text-[10px] font-bold text-blue-400 uppercase leading-none" title="Foreign Key">
        FK
      </span>
    );
  }
  return null;
}

export const ColumnRow = memo(function ColumnRow({ columnId }: ColumnRowProps): ReactNode {
  const column = useColumnStore((s) => s.columns[columnId]);

  if (!column) return null;

  const isDeleted = column.reviewState === 'deleted';
  const reviewColor = REVIEW_STATE_COLORS[column.reviewState];
  const showReviewBar = column.reviewState !== 'published' && column.reviewState !== 'unchanged';

  return (
    <PopoverTooltip
      content={column.note}
      className={`relative flex items-center gap-2 px-3 group/col border-b border-border/40 last:border-b-0 ${
        isDeleted ? 'opacity-50' : ''
      }`}
      style={{ height: 32, backgroundColor: showReviewBar ? `${reviewColor}12` : undefined }}
    >
      {/* Review state left bar */}
      {showReviewBar && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: reviewColor }}
        />
      )}

      {/* Connection handle — target (left) */}
      <Handle
        type="target"
        position={Position.Left}
        id={`col-${columnId}-target`}
        className="!w-2 !h-2 !bg-muted-foreground !border-border opacity-0 group-hover/col:opacity-100 !left-[-5px] transition-opacity"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      />

      {/* Key badge */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        <KeyBadge isPrimary={column.primaryKey} isForeign={column.foreignKey} />
      </div>

      {/* Column name */}
      <div className="flex-1 flex items-center gap-1.5 overflow-hidden">
        <span
          className={`text-xs text-foreground truncate ${isDeleted ? 'line-through' : ''}`}
          title={column.name}
        >
          {column.name}
        </span>
        {column.note && (
          <div className="text-muted-foreground/70 shrink-0">
            <NoteIcon size={12} />
          </div>
        )}
      </div>

      {/* Data type */}
      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
        {column.dataType}
        {column.nullable ? '' : '!'}
      </span>

      {/* Connection handle — source (right) */}
      <Handle
        type="source"
        position={Position.Right}
        id={`col-${columnId}-source`}
        className="!w-2 !h-2 !bg-muted-foreground !border-border opacity-0 group-hover/col:opacity-100 !right-[-5px] transition-opacity"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
        data-tableid={column.tableId}
      />
    </PopoverTooltip>
  );
});
