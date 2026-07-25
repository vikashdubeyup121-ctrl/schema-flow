import { useCallback, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type Node,
  type Edge,
  type OnSelectionChangeParams,
} from '@/lib/reactflow';
import { TableNode } from '../TableNode';
import { NoteNode } from '../NoteNode';
import { RelationshipEdge } from '../RelationshipEdge';
import { useCanvasHover } from '../../hooks/useCanvasHover';
import { useCanvasContextMenu } from '../../hooks/useCanvasContextMenu';
import { useCanvasViewportStore } from '../../stores/canvasViewport.store';
import { useCanvasSelectionStore } from '../../stores/canvasSelection.store';
import { useCanvasInteractionStore } from '../../stores/canvasInteraction.store';
import { CANVAS } from '../../constants/canvas.constants';
import type { TableNodeData, NoteNodeData, RelationshipEdgeData } from '../../types/CanvasNode';

// Node and edge types defined outside component to prevent recreation on render
const nodeTypes = {
  table: TableNode,
  note: NoteNode,
} as const;

const edgeTypes = {
  relationship: RelationshipEdge,
} as const;

type AnyMouseEvent = ReactMouseEvent | globalThis.MouseEvent;

interface CanvasCoreProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
}

export function CanvasCore({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: CanvasCoreProps): ReactNode {
  const setViewport = useCanvasViewportStore((s) => s.setViewport);
  const deselectAll = useCanvasSelectionStore((s) => s.deselectAll);
  const selectTable = useCanvasSelectionStore((s) => s.selectTable);
  const selectNote = useCanvasSelectionStore((s) => s.selectNote);
  const selectRelationship = useCanvasSelectionStore((s) => s.selectRelationship);
  const selectMultipleTables = useCanvasSelectionStore((s) => s.selectMultipleTables);
  const activeTool = useCanvasInteractionStore((s) => s.activeTool);
  const { onTableHover, onTableLeave } = useCanvasHover(edges);
  const { openMenu } = useCanvasContextMenu();

  const handlePaneClick = useCallback(() => {
    deselectAll();
  }, [deselectAll]);

  const handleNodeClick = useCallback(
    (e: AnyMouseEvent, node: Node) => {
      const multi = (e as ReactMouseEvent).metaKey || (e as ReactMouseEvent).ctrlKey;
      if (node.type === 'table') {
        const data = node.data as unknown as TableNodeData;
        selectTable(data.tableId, multi);
      } else if (node.type === 'note') {
        const data = node.data as unknown as NoteNodeData;
        selectNote(data.noteId, multi);
      }
    },
    [selectTable, selectNote],
  );

  const handleEdgeClick = useCallback(
    (e: AnyMouseEvent, edge: Edge) => {
      const multi = (e as ReactMouseEvent).metaKey || (e as ReactMouseEvent).ctrlKey;
      const data = edge.data as unknown as RelationshipEdgeData;
      selectRelationship(data.relationshipId, multi);
    },
    [selectRelationship],
  );

  // Sync rubber-band (drag) multi-selection to Zustand
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      const tableIds = selectedNodes
        .filter((n) => n.type === 'table')
        .map((n) => (n.data as unknown as TableNodeData).tableId);
      if (tableIds.length > 1) {
        selectMultipleTables(tableIds);
      }
    },
    [selectMultipleTables],
  );

  const handlePaneContextMenu = useCallback(
    (e: AnyMouseEvent) => {
      openMenu(e, 'canvas');
    },
    [openMenu],
  );

  const handleNodeContextMenu = useCallback(
    (e: AnyMouseEvent, node: Node) => {
      const data = node.data as unknown as TableNodeData;
      const targetType = node.type === 'note' ? 'note' : 'table';
      const targetId = node.type === 'note'
        ? (node.data as unknown as NoteNodeData).noteId
        : data.tableId;
      openMenu(e, targetType, targetId);
    },
    [openMenu],
  );

  const handleNodeMouseEnter = useCallback(
    (_e: AnyMouseEvent, node: Node) => {
      if (node.type === 'table') {
        const data = node.data as unknown as TableNodeData;
        onTableHover(data.tableId);
      }
    },
    [onTableHover],
  );

  const handleNodeMouseLeave = useCallback(() => {
    onTableLeave();
  }, [onTableLeave]);

  const minimapNodeColor = useCallback((node: Node): string => {
    if (node.type === 'table') {
      const data = node.data as unknown as TableNodeData;
      return data.color;
    }
    return 'hsl(var(--muted))';
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onPaneClick={handlePaneClick}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      onSelectionChange={handleSelectionChange}
      onPaneContextMenu={handlePaneContextMenu}
      onNodeContextMenu={handleNodeContextMenu}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      onMove={(_e, viewport) => setViewport(viewport)}
      minZoom={CANVAS.MIN_ZOOM}
      maxZoom={CANVAS.MAX_ZOOM}
      defaultViewport={{ x: 0, y: 0, zoom: CANVAS.DEFAULT_ZOOM }}
      panOnScroll
      panOnDrag={activeTool === 'hand' ? true : [1, 2]}
      selectionOnDrag={activeTool === 'pointer'}
      selectNodesOnDrag={false}
      panActivationKeyCode="Space"
      nodesDraggable
      nodesConnectable
      elementsSelectable
      snapToGrid={false}
      proOptions={{ hideAttribution: true }}
      className="bg-canvas"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={CANVAS.GRID_SIZE}
        size={1}
        color="hsl(var(--border))"
      />

      <MiniMap
        nodeColor={minimapNodeColor}
        maskColor="hsl(var(--background) / 0.7)"
        style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}
        position="bottom-right"
        pannable
        zoomable
      />
    </ReactFlow>
  );
}
