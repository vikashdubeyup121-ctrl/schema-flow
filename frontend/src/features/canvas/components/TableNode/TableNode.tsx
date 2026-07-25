import { memo, type ReactNode } from 'react';
import { NodeResizer } from '@/lib/reactflow';
import type { TableNodeProps } from './TableNode.types';
import { Table } from '@/features/table/components/Table';
import { CANVAS } from '../../constants/canvas.constants';

export const TableNode = memo(function TableNode({ data, selected }: TableNodeProps): ReactNode {
  return (
    <>
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
      <Table tableId={data.tableId} />
    </>
  );
});
