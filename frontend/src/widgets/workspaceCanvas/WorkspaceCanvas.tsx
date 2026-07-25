import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { ReactFlowProvider, useReactFlow, addEdge, type Node, type Edge, type OnConnect } from '@/lib/reactflow';
import {
  CanvasCore,
  CanvasToolbar,
  CanvasContextMenu,
  CanvasStatusBar,
  useCanvasAutosave,
} from '@/features/canvas';
import { useCanvasContextMenuStore } from '@/features/canvas/stores/canvasContextMenu.store';
import { useCanvasSelectionStore } from '@/features/canvas/stores/canvasSelection.store';
import { TABLE_COLORS, CANVAS } from '@/features/canvas/constants/canvas.constants';
import type { TableNodeData, NoteNodeData, RelationshipEdgeData } from '@/features/canvas/types/CanvasNode';
import type { Point } from '@/shared/types/Geometry';
import { EditorPanel, useEditorSync, useEditorStore } from '@/features/editor';

// ─── Inner component (uses useReactFlow — must be inside ReactFlowProvider) ───

interface WorkspaceCanvasInnerProps {
  diagramId: string;
}

function WorkspaceCanvasInner({ diagramId: _diagramId }: WorkspaceCanvasInnerProps): ReactNode {
  const { zoomIn, zoomOut, fitView, screenToFlowPosition } = useReactFlow();
  const { x: menuX, y: menuY } = useCanvasContextMenuStore();
  const selectMultipleTables = useCanvasSelectionStore((s) => s.selectMultipleTables);
  const { isOpen, width, toggleSidebar, setSidebarWidth } = useEditorStore();

  // Start empty — useEditorSync populates from DSL on mount
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const { dslText, onDslChange, syncCanvasToEditor } = useEditorSync({
    nodes,
    edges,
    onNodesChange: setNodes,
    onEdgesChange: setEdges,
  });

  // Keyboard shortcut: E to toggle editor sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      if (isEditing) return;
      if (e.key === 'e' || e.key === 'E') {
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const { status: autosaveStatus, lastSavedAt } = useCanvasAutosave({
    isDirty,
    onSave: async () => {
      // TODO: call diagram save API when backend is ready
      setIsDirty(false);
    },
  });

  const handleNodePositionCommit = useCallback((nodeId: string, position: Point) => {
    setNodes((ns) => ns.map((n) => (n.id === nodeId ? { ...n, position } : n)));
    setIsDirty(true);
  }, []);

  const handleConnect = useCallback<OnConnect>(
    (connection) => {
      const newEdge = {
        ...connection,
        id: crypto.randomUUID() as string,
        type: 'relationship',
        data: {
          relationshipId: crypto.randomUUID() as string,
          relationshipType: 'ONE_TO_MANY',
          sourceColumnId: connection.sourceHandle ?? '',
          targetColumnId: connection.targetHandle ?? '',
          reviewState: 'created',
        } satisfies RelationshipEdgeData,
      };
      const newEdges = addEdge(newEdge as Edge, edges);
      setEdges(newEdges);
      syncCanvasToEditor(nodes, newEdges);
      setIsDirty(true);
    },
    [edges, nodes, syncCanvasToEditor],
  );

  const handleAddTable = useCallback(
    (position: Point) => {
      const id = crypto.randomUUID();
      const colorIndex = Math.floor(Math.random() * TABLE_COLORS.length);
      const newNode: Node = {
        id,
        type: 'table',
        position,
        data: {
          tableId: id,
          name: 'new_table',
          color: TABLE_COLORS[colorIndex] ?? TABLE_COLORS[0],
          collapsed: false,
          reviewState: 'created',
          columns: [],
        } satisfies TableNodeData,
      };
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      syncCanvasToEditor(newNodes, edges);
      setIsDirty(true);
    },
    [nodes, edges, syncCanvasToEditor],
  );

  const handleAddNote = useCallback(
    (position: Point) => {
      const id = crypto.randomUUID();
      const newNode: Node = {
        id,
        type: 'note',
        position,
        data: {
          noteId: id,
          content: '',
          reviewState: 'created',
          width: CANVAS.NOTE_DEFAULT_WIDTH,
          height: CANVAS.NOTE_DEFAULT_HEIGHT,
        } satisfies NoteNodeData,
      };
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      setIsDirty(true);
      // Notes have no DSL representation — no sync needed
    },
    [nodes],
  );

  const handleAddTableFromToolbar = useCallback(() => {
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    handleAddTable(center);
  }, [screenToFlowPosition, handleAddTable]);

  const handleAddNoteFromToolbar = useCallback(() => {
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    handleAddNote(center);
  }, [screenToFlowPosition, handleAddNote]);

  const handleAddTableFromContextMenu = useCallback(() => {
    const position = screenToFlowPosition({ x: menuX, y: menuY });
    handleAddTable(position);
  }, [screenToFlowPosition, menuX, menuY, handleAddTable]);

  const handleAddNoteFromContextMenu = useCallback(() => {
    const position = screenToFlowPosition({ x: menuX, y: menuY });
    handleAddNote(position);
  }, [screenToFlowPosition, menuX, menuY, handleAddNote]);

  const handleDeleteTarget = useCallback(
    (id: string) => {
      const newNodes = nodes.filter((n) => {
        const data = n.data as unknown as TableNodeData | NoteNodeData;
        if ('tableId' in data) return data.tableId !== id;
        if ('noteId' in data) return data.noteId !== id;
        return true;
      });
      const newEdges = edges.filter((e) => {
        const data = e.data as unknown as RelationshipEdgeData;
        return data.relationshipId !== id;
      });
      setNodes(newNodes);
      setEdges(newEdges);
      syncCanvasToEditor(newNodes, newEdges);
      setIsDirty(true);
    },
    [nodes, edges, syncCanvasToEditor],
  );

  const handleSelectAll = useCallback(() => {
    const tableIds = nodes
      .filter((n) => n.type === 'table')
      .map((n) => (n.data as unknown as TableNodeData).tableId);
    selectMultipleTables(tableIds);
  }, [nodes, selectMultipleTables]);

  const handleFitView = useCallback(() => {
    fitView({ duration: 300 });
  }, [fitView]);

  const tableCount = nodes.filter((n) => n.type === 'table').length;

  return (
    <div className="flex w-full h-full overflow-hidden">
      {isOpen && (
        <EditorPanel
          value={dslText}
          onChange={onDslChange}
          width={width}
          onWidthChange={setSidebarWidth}
        />
      )}

      <div className="relative flex-1 overflow-hidden">
        <CanvasCore
          initialNodes={nodes}
          initialEdges={edges}
          onNodePositionCommit={handleNodePositionCommit}
          onConnect={handleConnect}
          onAddTable={handleAddTable}
        />

        <CanvasToolbar
          onAddTable={handleAddTableFromToolbar}
          onAddNote={handleAddNoteFromToolbar}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitView={handleFitView}
          isSidebarOpen={isOpen}
          onToggleSidebar={toggleSidebar}
        />

        <CanvasContextMenu
          onAddTable={handleAddTableFromContextMenu}
          onAddNote={handleAddNoteFromContextMenu}
          onDeleteTarget={handleDeleteTarget}
          onSelectAll={handleSelectAll}
          onFitView={handleFitView}
        />

        <CanvasStatusBar
          nodeCount={tableCount}
          autosaveStatus={autosaveStatus}
          lastSavedAt={lastSavedAt}
        />
      </div>
    </div>
  );
}

// ─── Public widget ─────────────────────────────────────────────────────────────

interface WorkspaceCanvasProps {
  diagramId: string;
}

export function WorkspaceCanvas({ diagramId }: WorkspaceCanvasProps): ReactNode {
  return (
    <ReactFlowProvider>
      <WorkspaceCanvasInner diagramId={diagramId} />
    </ReactFlowProvider>
  );
}
