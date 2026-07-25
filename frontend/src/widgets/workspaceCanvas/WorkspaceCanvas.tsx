import { useState, useCallback, type ReactNode } from 'react';
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

// ─── Mock initial data (dev only, replace with API data when backend is ready) ──

const MOCK_INITIAL_NODES: Node[] = [
  {
    id: 'table-users',
    type: 'table',
    position: { x: 80, y: 80 },
    data: {
      tableId: 'table-users',
      name: 'users',
      color: TABLE_COLORS[0],
      collapsed: false,
      reviewState: 'published',
      columns: [
        {
          id: 'col-users-id',
          name: 'id',
          dataType: 'UUID',
          nullable: false,
          primaryKey: true,
          foreignKey: false,
          unique: true,
          defaultValue: 'gen_random_uuid()',
          note: null,
          reviewState: 'published',
          position: 0,
        },
        {
          id: 'col-users-email',
          name: 'email',
          dataType: 'VARCHAR',
          nullable: false,
          primaryKey: false,
          foreignKey: false,
          unique: true,
          defaultValue: null,
          note: null,
          reviewState: 'published',
          position: 1,
        },
        {
          id: 'col-users-name',
          name: 'name',
          dataType: 'VARCHAR',
          nullable: true,
          primaryKey: false,
          foreignKey: false,
          unique: false,
          defaultValue: null,
          note: null,
          reviewState: 'published',
          position: 2,
        },
        {
          id: 'col-users-created-at',
          name: 'created_at',
          dataType: 'TIMESTAMPTZ',
          nullable: false,
          primaryKey: false,
          foreignKey: false,
          unique: false,
          defaultValue: 'now()',
          note: null,
          reviewState: 'published',
          position: 3,
        },
      ],
    } satisfies TableNodeData,
  },
  {
    id: 'table-diagrams',
    type: 'table',
    position: { x: 400, y: 80 },
    data: {
      tableId: 'table-diagrams',
      name: 'diagrams',
      color: TABLE_COLORS[1],
      collapsed: false,
      reviewState: 'published',
      columns: [
        {
          id: 'col-diagrams-id',
          name: 'id',
          dataType: 'UUID',
          nullable: false,
          primaryKey: true,
          foreignKey: false,
          unique: true,
          defaultValue: 'gen_random_uuid()',
          note: null,
          reviewState: 'published',
          position: 0,
        },
        {
          id: 'col-diagrams-owner-id',
          name: 'owner_id',
          dataType: 'UUID',
          nullable: false,
          primaryKey: false,
          foreignKey: true,
          unique: false,
          defaultValue: null,
          note: null,
          reviewState: 'published',
          position: 1,
        },
        {
          id: 'col-diagrams-name',
          name: 'name',
          dataType: 'VARCHAR',
          nullable: false,
          primaryKey: false,
          foreignKey: false,
          unique: false,
          defaultValue: null,
          note: null,
          reviewState: 'modified',
          position: 2,
        },
        {
          id: 'col-diagrams-created-at',
          name: 'created_at',
          dataType: 'TIMESTAMPTZ',
          nullable: false,
          primaryKey: false,
          foreignKey: false,
          unique: false,
          defaultValue: 'now()',
          note: null,
          reviewState: 'published',
          position: 3,
        },
      ],
    } satisfies TableNodeData,
  },
  {
    id: 'note-welcome',
    type: 'note',
    position: { x: 80, y: 340 },
    data: {
      noteId: 'note-welcome',
      content: '## SchemaFlow\n\nThis is a **mock canvas** for development.\n\nBackend integration coming soon.',
      reviewState: 'published',
      width: CANVAS.NOTE_DEFAULT_WIDTH,
      height: CANVAS.NOTE_DEFAULT_HEIGHT,
    } satisfies NoteNodeData,
  },
];

const MOCK_INITIAL_EDGES: Edge[] = [
  {
    id: 'rel-users-diagrams',
    type: 'relationship',
    source: 'table-users',
    target: 'table-diagrams',
    sourceHandle: 'col-users-id-right',
    targetHandle: 'col-diagrams-owner-id-left',
    data: {
      relationshipId: 'rel-users-diagrams',
      relationshipType: 'ONE_TO_MANY',
      sourceColumnId: 'col-users-id',
      targetColumnId: 'col-diagrams-owner-id',
      reviewState: 'published',
    } satisfies RelationshipEdgeData,
  },
];

// ─── Inner component (uses useReactFlow — must be inside ReactFlowProvider) ───

interface WorkspaceCanvasInnerProps {
  diagramId: string;
}

function WorkspaceCanvasInner({ diagramId: _diagramId }: WorkspaceCanvasInnerProps): ReactNode {
  const { zoomIn, zoomOut, fitView, screenToFlowPosition } = useReactFlow();
  const { x: menuX, y: menuY } = useCanvasContextMenuStore();
  const selectMultipleTables = useCanvasSelectionStore((s) => s.selectMultipleTables);

  const [nodes, setNodes] = useState<Node[]>(MOCK_INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(MOCK_INITIAL_EDGES);
  const [isDirty, setIsDirty] = useState(false);

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
      setEdges((es) =>
        addEdge(
          {
            ...connection,
            type: 'relationship',
            data: {
              relationshipId: crypto.randomUUID(),
              relationshipType: 'ONE_TO_MANY',
              sourceColumnId: connection.sourceHandle ?? '',
              targetColumnId: connection.targetHandle ?? '',
              reviewState: 'created',
            } satisfies RelationshipEdgeData,
          },
          es,
        ),
      );
      setIsDirty(true);
    },
    [],
  );

  const handleAddTable = useCallback((position: Point) => {
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
    setNodes((ns) => [...ns, newNode]);
    setIsDirty(true);
  }, []);

  const handleAddNote = useCallback((position: Point) => {
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
    setNodes((ns) => [...ns, newNode]);
    setIsDirty(true);
  }, []);

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

  const handleDeleteTarget = useCallback((id: string) => {
    setNodes((ns) => ns.filter((n) => {
      const data = n.data as unknown as TableNodeData | NoteNodeData;
      if ('tableId' in data) return data.tableId !== id;
      if ('noteId' in data) return data.noteId !== id;
      return true;
    }));
    setEdges((es) => es.filter((e) => {
      const data = e.data as unknown as RelationshipEdgeData;
      return data.relationshipId !== id;
    }));
    setIsDirty(true);
  }, []);

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
    <div className="relative w-full h-full">
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
