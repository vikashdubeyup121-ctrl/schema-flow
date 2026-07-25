import { memo, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useColumnStore } from '../../stores/column.store';
import { ColumnRow } from '../ColumnRow';

interface ColumnListProps {
  tableId: string;
}

export const ColumnList = memo(function ColumnList({ tableId }: ColumnListProps): ReactNode {
  const columns = useColumnStore(useShallow((s) => s.getTableColumns(tableId)));

  return (
    <>
      {columns.map((col) => (
        <ColumnRow key={col.id} columnId={col.id} />
      ))}
    </>
  );
});
