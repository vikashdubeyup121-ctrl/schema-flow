import { useCallback, useMemo, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from '@/lib/reactflow';
import { TableNode } from '../TableNode';
import { NoteNode } from '../NoteNode';
import { RelationshipEdge } from '../RelationshipEdge';
import { useCanvasHover } from '../../hooks/useCanvasHover';
import { useCanvasContextMenu } from '../../hooks/useCanvasContextMenu';
import { useCanvasViewportStore } from '../../stores/canvasViewport.store';
import { useCanvasSelectionStore } from '../../stores/canvasSelection.store';
import { snapToGrid } from '../../services/snapEngine.service';
import { CANVAS } from '../../constants/canvas.constants';
import type { TableNodeData } from '../../types/CanvasNode';
import type { Point } from '@/shared/types/Geometry';

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
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodePositionCommit: (nodeId: string, position: Point) => void;
  onConnect: OnConnect;
  onAddTable: (position: Point) => void;
}

export function CanvasCore({
  initialNodes,
  initialEdges,
  onNodePositionCommit,
  onConnect,
  onAddTable: _onAddTable,
}: CanvasCoreProps): ReactNode {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const setViewport = useCanvasViewportStore((s) => s.setViewport);
  const deselectAll = useCanvasSelectionStore((s) => s.deselectAll);
  const { onTableHover, onTableLeave } = useCanvasHover(edges);
  const { openMenu } = useCanvasContextMenu();

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      // Commit position on drag end
      for (const change of changes) {
        if (change.type === 'position' && !change.dragging && change.position) {
          const snapped = snapToGrid(change.position);
          onNodePositionCommit(change.id, snapped);
        }
      }
    },
    [onNodesChange, onNodePositionCommit],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange],
  );

  const handlePaneClick = useCallback(() => {
    deselectAll();
  }, [deselectAll]);

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
        ? (node.data as unknown as { noteId: string }).noteId
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

  // Sync external node/edge updates
  useMemo(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useMemo(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={onConnect}
      onPaneClick={handlePaneClick}
      onPaneContextMenu={handlePaneContextMenu}
      onNodeContextMenu={handleNodeContextMenu}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      onMove={(_e, viewport) => setViewport(viewport)}
      minZoom={CANVAS.MIN_ZOOM}
      maxZoom={CANVAS.MAX_ZOOM}
      defaultViewport={{ x: 0, y: 0, zoom: CANVAS.DEFAULT_ZOOM }}
      panOnScroll
      panOnDrag={[1, 2]}
      selectionOnDrag={false}
      selectNodesOnDrag={false}
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
