import { memo, useCallback, useState, type ReactNode, type ChangeEvent, type KeyboardEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTableStore } from '@/features/table/stores/table.store';
import { useColumnStore } from '@/features/column/stores/column.store';
import { ColorPicker } from '@/shared/components/ColorPicker';
import { TABLE_COLORS, REVIEW_STATE_COLORS } from '@/features/canvas/constants/canvas.constants';
import { PropertySection } from '../PropertySection/PropertySection';
import { PropertyRow } from '../PropertyRow/PropertyRow';

interface TableInspectorProps {
  tableId: string;
}

export const TableInspector = memo(function TableInspector({ tableId }: TableInspectorProps): ReactNode {
  const table = useTableStore((s) => s.tables[tableId]);
  const columns = useColumnStore(useShallow((s) => s.getTableColumns(tableId)));
  const updateTable = useTableStore((s) => s.updateTable);

  const [nameValue, setNameValue] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const handleNameFocus = useCallback(() => {
    if (!table) return;
    setNameValue(table.name);
    setIsEditingName(true);
  }, [table]);

  const handleNameBlur = useCallback(() => {
    if (!table) return;
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== table.name) {
      updateTable(tableId, { name: trimmed });
    } else {
      setNameValue(table.name);
    }
    setIsEditingName(false);
  }, [table, nameValue, tableId, updateTable]);

  const handleNameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      } else if (e.key === 'Escape') {
        if (table) setNameValue(table.name);
        setIsEditingName(false);
        e.currentTarget.blur();
      }
    },
    [table],
  );

  const handleColorChange = useCallback(
    (color: string) => {
      updateTable(tableId, { color });
    },
    [tableId, updateTable],
  );

  if (!table) return null;

  const reviewColor = REVIEW_STATE_COLORS[table.reviewState];

  return (
    <div className="flex flex-col overflow-y-auto flex-1">
      <PropertySection title="General">
        <PropertyRow label="Name">
          <input
            type="text"
            value={isEditingName ? nameValue : table.name}
            onFocus={handleNameFocus}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNameValue(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="w-full h-8 px-2 rounded border border-border bg-background text-sm text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none transition-colors"
          />
        </PropertyRow>
        <PropertyRow label="Color">
          <ColorPicker
            value={table.color}
            options={TABLE_COLORS}
            onChange={handleColorChange}
          />
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Columns">
        {columns.length === 0 ? (
          <span className="text-xs text-muted-foreground">No columns yet.</span>
        ) : (
          <div className="flex flex-col gap-1">
            {columns.map((col) => (
              <div
                key={col.id}
                className="flex items-center justify-between px-2 py-1 rounded bg-surface text-xs"
              >
                <span className="text-foreground font-medium truncate">{col.name}</span>
                <span className="text-muted-foreground ml-2 shrink-0">{col.dataType}</span>
              </div>
            ))}
          </div>
        )}
      </PropertySection>

      <PropertySection title="Review" defaultOpen={false}>
        <PropertyRow label="State">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: reviewColor }}
            />
            <span className="text-sm text-foreground capitalize">{table.reviewState}</span>
          </div>
        </PropertyRow>
      </PropertySection>
    </div>
  );
});
