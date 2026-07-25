import type { Node, NodeProps } from '@/lib/reactflow';
import type { TableNodeData, CanvasColumn } from '../../types/CanvasNode';
import type { ReviewState } from '../../types/Canvas';

export type { TableNodeData };

export interface TableHeaderProps {
  name: string;
  color: string;
  collapsed: boolean;
  reviewState: ReviewState;
  isSelected: boolean;
  isHovered: boolean;
  onToggleCollapse: () => void;
  onNameChange: (name: string) => void;
}

export interface ColumnRowProps {
  column: CanvasColumn;
  tableId: string;
  isHovered: boolean;
}

export type TableNodeType = Node<TableNodeData, 'table'>;
export type TableNodeProps = NodeProps<TableNodeType>;
