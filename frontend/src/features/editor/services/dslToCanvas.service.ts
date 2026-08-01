import type { Node, Edge } from '@/lib/reactflow';
import type { TableNodeData, CanvasColumn, RelationshipEdgeData, ColumnDataType } from '@/features/canvas/types/CanvasNode';
import { TABLE_COLORS } from '@/features/canvas/constants/canvas.constants';
import type { DslAst, DslTable } from '../types/DslAst';

const COLUMN_LAYOUT_STEP_X = 320;
const LAYOUT_ROWS = 3;
const ROW_SPACING = 80;
const HEADER_HEIGHT = 48;
const COLUMN_HEIGHT = 28;
const FOOTER_HEIGHT = 16;

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
  computedPosition: { x: number; y: number },
  publishedAst?: DslAst
): Node {
  const id = existingNode?.id ?? `table-${dslTable.name}`;
  const position = existingNode?.position ?? computedPosition;
  const existingData = existingNode?.data as unknown as TableNodeData | undefined;

  const publishedTable = publishedAst?.tables?.find(t => t.name === dslTable.name);

  const columns: CanvasColumn[] = dslTable.columns.map((col, colIndex) => {
    const existingCol = existingData?.columns.find((c) => c.name === col.name);
    let reviewState: typeof existingCol.reviewState = 'created';
    if (publishedAst) {
      reviewState = publishedTable?.columns?.find(c => c.name === col.name) ? 'unchanged' : 'created';
    } else if (existingCol?.reviewState) {
      reviewState = existingCol.reviewState;
    }

    return {
      id: existingCol?.id ?? `col-${id}-${col.name}`,
      name: col.name,
      dataType: toColumnDataType(col.dataType),
      nullable: !col.primaryKey && !col.notNull,
      primaryKey: col.primaryKey,
      foreignKey: col.refTarget !== null,
      unique: col.unique,
      defaultValue: col.defaultValue,
      note: col.note ?? null,
      reviewState,
      position: colIndex,
    };
  });

  const colorIndex = Math.abs(dslTable.name.charCodeAt(0)) % TABLE_COLORS.length;
  
  let tableReviewState: typeof existingData.reviewState = 'created';
  if (publishedAst) {
    tableReviewState = publishedTable ? 'unchanged' : 'created';
  } else if (existingData?.reviewState) {
    tableReviewState = existingData.reviewState;
  }

  const data: TableNodeData = {
    tableId: id,
    name: dslTable.name,
    color: dslTable.color ?? existingData?.color ?? (TABLE_COLORS[colorIndex] ?? TABLE_COLORS[0]),
    collapsed: existingData?.collapsed ?? false,
    reviewState: tableReviewState,
    columns,
  };

  return { id, type: 'table', position, data, style: { width: 240 } };
}

export function dslAstToCanvasNodes(
  ast: DslAst,
  existingNodes: Node[],
  existingEdges: Edge[],
  publishedAst?: DslAst,
  nodesData?: any
): { nodes: Node[]; edges: Edge[] } {
  const tablesWithRels = ast.tables.filter(t => ast.refs.some(r => r.fromTable === t.name || r.toTable === t.name));
  const tablesWithoutRels = ast.tables.filter(t => !ast.refs.some(r => r.fromTable === t.name || r.toTable === t.name));

  const rowMaxHeights = Array(LAYOUT_ROWS).fill(0);
  let isolatedRowMaxHeight = 0;
  
  // First pass: find maximum height for each row of connected tables
  tablesWithRels.forEach((table, index) => {
    const rowIndex = index % LAYOUT_ROWS;
    const tableHeight = HEADER_HEIGHT + table.columns.length * COLUMN_HEIGHT + FOOTER_HEIGHT;
    if (tableHeight > rowMaxHeights[rowIndex]) {
      rowMaxHeights[rowIndex] = tableHeight;
    }
  });

  // First pass: find maximum height for isolated tables
  tablesWithoutRels.forEach((table) => {
    const tableHeight = HEADER_HEIGHT + table.columns.length * COLUMN_HEIGHT + FOOTER_HEIGHT;
    if (tableHeight > isolatedRowMaxHeight) {
      isolatedRowMaxHeight = tableHeight;
    }
  });

  // Calculate starting Y coordinate for each connected row
  const rowY = Array(LAYOUT_ROWS).fill(80);
  for (let i = 1; i < LAYOUT_ROWS; i++) {
    rowY[i] = rowY[i - 1] + rowMaxHeights[i - 1] + ROW_SPACING;
  }

  // Calculate starting Y coordinate for isolated tables row
  const lastConnectedRowIndex = LAYOUT_ROWS - 1;
  const isolatedRowY = tablesWithRels.length > 0 
    ? rowY[lastConnectedRowIndex] + rowMaxHeights[lastConnectedRowIndex] + (ROW_SPACING * 2) 
    : 80;

  const connectedNodes: Node[] = tablesWithRels.map((table, index) => {
    const existing = existingNodes.find(
      (n) => n.type === 'table' && (n.data as unknown as TableNodeData).name === table.name,
    );
    const rowIndex = index % LAYOUT_ROWS;
    const colIndex = Math.floor(index / LAYOUT_ROWS);
    
    let computedPosition = {
      x: colIndex * COLUMN_LAYOUT_STEP_X + 80,
      y: rowY[rowIndex],
    };
    if (nodesData?.[table.name]) {
      computedPosition = { x: nodesData[table.name].x, y: nodesData[table.name].y };
    }

    return buildTableNode(table, existing, computedPosition, publishedAst);
  });

  const isolatedNodes: Node[] = tablesWithoutRels.map((table, index) => {
    const existing = existingNodes.find(
      (n) => n.type === 'table' && (n.data as unknown as TableNodeData).name === table.name,
    );
    let computedPosition = {
      x: index * COLUMN_LAYOUT_STEP_X + 80,
      y: isolatedRowY,
    };
    if (nodesData?.[table.name]) {
      computedPosition = { x: nodesData[table.name].x, y: nodesData[table.name].y };
    }
    
    return buildTableNode(table, existing, computedPosition, publishedAst);
  });

  const nodes = [...connectedNodes, ...isolatedNodes];

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

    let reviewState: typeof existingEdge extends undefined ? undefined : any = 'created';
    if (publishedAst) {
      reviewState = publishedAst.refs?.find(r => r.fromTable === ref.fromTable && r.fromColumn === ref.fromColumn && r.toTable === ref.toTable && r.toColumn === ref.toColumn) ? 'unchanged' : 'created';
    } else if (existingEdge?.data) {
      reviewState = (existingEdge.data as unknown as RelationshipEdgeData).reviewState;
    }

    const edgeData: RelationshipEdgeData = {
      relationshipId: edgeId,
      relationshipType: relType,
      sourceColumnId: sourceCol.id,
      targetColumnId: targetCol.id,
      reviewState,
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
