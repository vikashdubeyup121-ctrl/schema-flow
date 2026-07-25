import type { Node, Edge } from '@/lib/reactflow';
import type { TableNodeData, CanvasColumn, RelationshipEdgeData, ColumnDataType } from '@/features/canvas/types/CanvasNode';
import { TABLE_COLORS } from '@/features/canvas/constants/canvas.constants';
import type { DslAst, DslTable } from '../types/DslAst';

const COLUMN_LAYOUT_STEP_X = 320;
const COLUMN_LAYOUT_STEP_Y = 0;
const LAYOUT_COLS = 3;

function toColumnDataType(raw: string): ColumnDataType {
  const upper = raw.toUpperCase();
  const valid: ColumnDataType[] = [
    'INT', 'BIGINT', 'SMALLINT', 'DECIMAL', 'FLOAT', 'DOUBLE',
    'VARCHAR', 'TEXT', 'CHAR', 'BOOLEAN', 'DATE', 'TIMESTAMP',
    'TIMESTAMPTZ', 'UUID', 'JSON', 'JSONB', 'BYTEA', 'SERIAL', 'BIGSERIAL',
  ];
  return valid.includes(upper as ColumnDataType) ? (upper as ColumnDataType) : 'VARCHAR';
}

function buildTableNode(
  dslTable: DslTable,
  existingNode: Node | undefined,
  index: number,
): Node {
  const id = existingNode?.id ?? `table-${dslTable.name}`;
  const position = existingNode?.position ?? {
    x: (index % LAYOUT_COLS) * COLUMN_LAYOUT_STEP_X + 80,
    y: Math.floor(index / LAYOUT_COLS) * 260 + 80 + COLUMN_LAYOUT_STEP_Y,
  };
  const existingData = existingNode?.data as unknown as TableNodeData | undefined;

  const columns: CanvasColumn[] = dslTable.columns.map((col, colIndex) => {
    const existingCol = existingData?.columns.find((c) => c.name === col.name);
    return {
      id: existingCol?.id ?? `col-${id}-${col.name}`,
      name: col.name,
      dataType: toColumnDataType(col.dataType),
      nullable: !col.primaryKey && !col.notNull,
      primaryKey: col.primaryKey,
      foreignKey: col.refTarget !== null,
      unique: col.unique,
      defaultValue: col.defaultValue,
      note: null,
      reviewState: existingCol?.reviewState ?? 'created',
      position: colIndex,
    };
  });

  const colorIndex = Math.abs(dslTable.name.charCodeAt(0)) % TABLE_COLORS.length;
  const data: TableNodeData = {
    tableId: id,
    name: dslTable.name,
    color: existingData?.color ?? (TABLE_COLORS[colorIndex] ?? TABLE_COLORS[0]),
    collapsed: existingData?.collapsed ?? false,
    reviewState: existingData?.reviewState ?? 'created',
    columns,
  };

  return { id, type: 'table', position, data, style: { width: 240 } };
}

export function dslAstToCanvasNodes(
  ast: DslAst,
  existingNodes: Node[],
  existingEdges: Edge[],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = ast.tables.map((table, index) => {
    const existing = existingNodes.find(
      (n) => n.type === 'table' && (n.data as unknown as TableNodeData).name === table.name,
    );
    return buildTableNode(table, existing, index);
  });

  // Preserve non-table nodes (notes)
  const noteNodes = existingNodes.filter((n) => n.type === 'note');
  const allNodes = [...nodes, ...noteNodes];

  const edges: Edge[] = [];
  for (const ref of ast.refs) {
    const sourceNode = nodes.find((n) => (n.data as unknown as TableNodeData).name === ref.fromTable);
    const targetNode = nodes.find((n) => (n.data as unknown as TableNodeData).name === ref.toTable);
    if (!sourceNode || !targetNode) continue;

    const sourceData = sourceNode.data as unknown as TableNodeData;
    const targetData = targetNode.data as unknown as TableNodeData;

    const sourceCol = sourceData.columns.find((c) => c.name === ref.fromColumn);
    const targetCol = targetData.columns.find((c) => c.name === ref.toColumn);
    if (!sourceCol || !targetCol) continue;

    const relType =
      ref.type === '>' ? 'MANY_TO_ONE' :
      ref.type === '<' ? 'ONE_TO_MANY' : 'ONE_TO_ONE';

    const edgeId = `rel-${sourceNode.id}-${targetNode.id}-${sourceCol.id}-${targetCol.id}`;
    const existingEdge = existingEdges.find((e) => e.id === edgeId);

    const edgeData: RelationshipEdgeData = {
      relationshipId: edgeId,
      relationshipType: relType,
      sourceColumnId: sourceCol.id,
      targetColumnId: targetCol.id,
      reviewState: existingEdge ? (existingEdge.data as unknown as RelationshipEdgeData).reviewState : 'created',
    };

    edges.push({
      id: edgeId,
      type: 'relationship',
      source: sourceNode.id,
      target: targetNode.id,
      sourceHandle: `col-${sourceCol.id}-source`,
      targetHandle: `col-${targetCol.id}-target`,
      data: edgeData,
    });
  }

  return { nodes: allNodes, edges };
}
