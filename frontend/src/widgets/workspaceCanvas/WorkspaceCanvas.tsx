import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { diagramQueryOptions } from '@/features/diagram/api/queries';
import { updateDiagram } from '@/features/diagram/api/mutations';
import { diagramKeys } from '@/features/diagram/api/keys';
import { queryClient } from '@/shared/api/queryClient';
import {
  ReactFlowProvider,
  useReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnConnect,
  type NodeChange,
  type EdgeChange,
} from '@/lib/reactflow';
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
import type { RelationshipType } from '@/features/canvas/types/Canvas';
import type { Point } from '@/shared/types/Geometry';
import { EditorPanel, useEditorSync, useEditorStore } from '@/features/editor';
import { syncNodesToFeatureStores } from '@/features/canvas/services';
import { useTableStore } from '@/features/table/stores/table.store';
import { useColumnStore } from '@/features/column/stores/column.store';
import { useNoteStore } from '@/features/note/stores/note.store';
import { useRelationshipStore } from '@/features/relationship/stores/relationship.store';
// import { PropertiesPanel } from '@/widgets/workspace/PropertiesPanel';

// ─── Inner component (uses useReactFlow — must be inside ReactFlowProvider) ───

interface WorkspaceCanvasInnerProps {
  diagramId: string;
}

function WorkspaceCanvasInner({ diagramId }: WorkspaceCanvasInnerProps): ReactNode {
  const { zoomIn, zoomOut, fitView, screenToFlowPosition } = useReactFlow();
  const { x: menuX, y: menuY } = useCanvasContextMenuStore();
  const selectMultipleTables = useCanvasSelectionStore((s) => s.selectMultipleTables);
  const isOpen = useEditorStore((s) => s.isOpen);
  const width = useEditorStore((s) => s.width);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const setSidebarWidth = useEditorStore((s) => s.setSidebarWidth);
  const setDslText = useEditorStore((s) => s.setDslText);

  // Fetch diagram data
  const { data: diagram, isLoading } = useQuery(diagramQueryOptions(diagramId));

  // Start empty — useEditorSync populates from DSL on mount
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize DSL from DB when loaded
  useEffect(() => {
    if (diagram && !hasInitialized) {
      if (diagram.dslText) {
        setDslText(diagram.dslText);
      } else {
        // If it's a completely new diagram, it will just use whatever is in the store 
        // (which might be the DEFAULT_DSL, or empty). We can leave it as DEFAULT_DSL.
        // But we MUST mark it dirty so it gets saved to the backend!
        setIsDirty(true);
      }
      setHasInitialized(true);
    }
  }, [diagram, hasInitialized, setDslText]);

  const { dslText, onDslChange, syncCanvasToEditor } = useEditorSync({
    nodes,
    edges,
    publishedDslText: diagram?.publishedDslText ?? null,
    onNodesChange: (newNodes) => {
      setNodes(newNodes);
      syncNodesToFeatureStores(newNodes, edges);
    },
    onEdgesChange: (newEdges) => {
      setEdges(newEdges);
      syncNodesToFeatureStores(nodes, newEdges);
    },
    enabled: hasInitialized, // Only sync after initializing from DB
    onDirty: () => setIsDirty(true),
  });

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((ns) => {
        const updated = applyNodeChanges(changes, ns);
        
        let shouldSync = false;
        for (const change of changes) {
          if (change.type === 'position' && change.dragging === false) {
            setIsDirty(true);
            shouldSync = true; // Drag ended
          } else if (
            change.type === 'add' ||
            change.type === 'remove' ||
            change.type === 'dimensions'
          ) {
            shouldSync = true;
          }
        }
        
        if (shouldSync) {
          syncNodesToFeatureStores(updated, edges);
        }
        return updated;
      });
    },
    [edges],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((es) => {
        const updated = applyEdgeChanges(changes, es);
        syncNodesToFeatureStores(nodes, updated);
        return updated;
      });
    },
    [nodes],
  );

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
      if (diagram) {
        await updateDiagram(diagramId, undefined, diagram.projectId, dslText);
      }
      setIsDirty(false);
    },
  });


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
      syncNodesToFeatureStores(nodes, newEdges);
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
        style: { width: CANVAS.TABLE_DEFAULT_WIDTH },
      };
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      syncCanvasToEditor(newNodes, edges);
      syncNodesToFeatureStores(newNodes, edges);
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
      syncNodesToFeatureStores(newNodes, edges);
      setIsDirty(true);
      // Notes have no DSL representation — no sync needed
    },
    [nodes, edges],
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
      // Also remove from feature stores
      useTableStore.getState().removeTable(id);
      useColumnStore.getState().removeTableColumns(id);
      useNoteStore.getState().removeNote(id);
      useRelationshipStore.getState().removeRelationship(id);
      setIsDirty(true);
    },
    [nodes, edges, syncCanvasToEditor],
  );

  const handleRenameTable = useCallback(
    (tableId: string, newName: string) => {
      useTableStore.getState().updateTable(tableId, { name: newName });
      setNodes((ns) => {
        const newNodes = ns.map((n) => {
          if (n.id === tableId) {
            const data = n.data as unknown as TableNodeData;
            return { ...n, data: { ...data, name: newName } };
          }
          return n;
        });
        return newNodes;
      });
      setIsDirty(true);
    },
    [],
  );

  const handleChangeTableColor = useCallback(
    (tableId: string, color: string) => {
      useTableStore.getState().updateTable(tableId, { color });
      setNodes((ns) => {
        const newNodes = ns.map((n) => {
          if (n.id === tableId) {
            const data = n.data as unknown as TableNodeData;
            return { ...n, data: { ...data, color } };
          }
          return n;
        });
        return newNodes;
      });
      setIsDirty(true);
    },
    [],
  );

  const handleChangeRelationshipType = useCallback(
    (relId: string, relationshipType: RelationshipType) => {
      useRelationshipStore.getState().updateRelationship(relId, { relationshipType });
      setEdges((es) => {
        const newEdges = es.map((e) => {
          const data = e.data as unknown as RelationshipEdgeData;
          if (data.relationshipId === relId) {
            return { ...e, data: { ...data, relationshipType } };
          }
          return e;
        });
        return newEdges;
      });
      setIsDirty(true);
    },
    [],
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

  if (isLoading || !hasInitialized) {
    return <div className="flex items-center justify-center w-full h-full text-muted-foreground">Loading diagram...</div>;
  }

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Left: Editor sidebar */}
      {isOpen && (
        <EditorPanel
          value={dslText}
          onChange={onDslChange}
          width={width}
          onWidthChange={setSidebarWidth}
        />
      )}

      {/* Center: Canvas */}
      <div className="relative flex-1 overflow-hidden">
        <CanvasCore
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
        />

        <CanvasToolbar
          onAddTable={handleAddTableFromToolbar}
          onAddNote={handleAddNoteFromToolbar}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitView={handleFitView}
          isSidebarOpen={isOpen}
          onToggleSidebar={toggleSidebar}
          onPublish={async () => {
            const { publishDiagram } = await import('@/features/diagram/api/mutations');
            try {
              await publishDiagram(diagramId, diagram!.projectId);
              // Force refetch to get updated diagram and clear review states
              queryClient.invalidateQueries({ queryKey: diagramKeys.byProject(diagram!.projectId) });
              window.location.reload(); // Simple way to clear UI states until real-time is set up
            } catch (err) {
              console.error('Failed to publish', err);
            }
          }}
        />

        <CanvasContextMenu
          onAddTable={handleAddTableFromContextMenu}
          onAddNote={handleAddNoteFromContextMenu}
          onDeleteTarget={handleDeleteTarget}
          onSelectAll={handleSelectAll}
          onFitView={handleFitView}
          onRenameTable={handleRenameTable}
          onChangeTableColor={handleChangeTableColor}
          onChangeRelationshipType={handleChangeRelationshipType}
        />

        <CanvasStatusBar
          nodeCount={tableCount}
          autosaveStatus={autosaveStatus}
          lastSavedAt={lastSavedAt}
        />
      </div>

      {/* Right: Properties panel */}
      {/* <PropertiesPanel /> */}
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
