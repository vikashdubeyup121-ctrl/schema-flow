import type { Node, Edge } from '@/lib/reactflow';
import type { TableNodeData, RelationshipEdgeData } from '@/features/canvas/types/CanvasNode';

function serializeTable(data: TableNodeData): string {
  const lines: string[] = [`Table ${data.name} {`];

  if (data.color) {
    lines.push(`  // @color: ${data.color}`);
  }

  for (const col of data.columns) {
    const constraints: string[] = [];

    if (col.primaryKey) constraints.push('pk');
    else if (!col.nullable) constraints.push('not null');
    if (col.unique) constraints.push('unique');
    if (col.defaultValue) constraints.push(`default: \`${col.defaultValue}\``);
    if (col.foreignKey) constraints.push('// fk');

    const constraintStr = constraints.length > 0 ? ` [${constraints.join(', ')}]` : '';
    lines.push(`  ${col.name} ${col.dataType.toLowerCase()}${constraintStr}`);
  }

  lines.push('}');
  return lines.join('\n');
}

function relationshipTypeToRefSymbol(type: string): string {
  switch (type) {
    case 'ONE_TO_MANY': return '>';
    case 'MANY_TO_ONE': return '<';
    case 'ONE_TO_ONE': return '-';
    default: return '>';
  }
}

export function serializeToDsl(nodes: Node[], edges: Edge[]): string {
  const parts: string[] = [];

  const tableNodes = nodes.filter((n) => n.type === 'table');

  for (const node of tableNodes) {
    const data = node.data as unknown as TableNodeData;
    parts.push(serializeTable(data));
  }

  const refLines: string[] = [];
  for (const edge of edges) {
    const data = edge.data as unknown as RelationshipEdgeData;
    if (!data) continue;

    // Find source and target column names from the handle IDs
    // sourceHandle format: "col-<id>-source", targetHandle format: "col-<id>-target"
    const sourceColId = edge.sourceHandle?.replace('col-', '').replace('-source', '') ?? '';
    const targetColId = edge.targetHandle?.replace('col-', '').replace('-target', '') ?? '';

    // Find the source table and column
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) continue;

    const sourceData = sourceNode.data as unknown as TableNodeData;
    const targetData = targetNode.data as unknown as TableNodeData;

    const sourceCol = sourceData.columns.find((c) => c.id === sourceColId);
    const targetCol = targetData.columns.find((c) => c.id === targetColId);

    const sourceColName = sourceCol?.name ?? sourceColId;
    const targetColName = targetCol?.name ?? targetColId;

    const symbol = relationshipTypeToRefSymbol(data.relationshipType);
    refLines.push(`Ref: ${sourceData.name}.${sourceColName} ${symbol} ${targetData.name}.${targetColName}`);
  }

  if (refLines.length > 0) {
    parts.push(refLines.join('\n'));
  }

  return parts.join('\n\n');
}
