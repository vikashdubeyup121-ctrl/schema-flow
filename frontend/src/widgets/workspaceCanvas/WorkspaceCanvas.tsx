import { useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
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
import { useAuth } from '@/app/providers/AuthProvider';
import { useProjectMembers, ManageMembersModal } from '@/features/project';
import { projectQueryOptions } from '@/features/project/api/queries';
import { Toast } from '@/shared/stores/toast.store';
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
  const { zoomIn, zoomOut, fitView, screenToFlowPosition, setCenter } = useReactFlow();
  const { x: menuX, y: menuY } = useCanvasContextMenuStore();
  const selectMultipleTables = useCanvasSelectionStore((s) => s.selectMultipleTables);
  const isOpen = useEditorStore((s) => s.isOpen);
  const width = useEditorStore((s) => s.width);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const setSidebarWidth = useEditorStore((s) => s.setSidebarWidth);
  const setDslText = useEditorStore((s) => s.setDslText);

  // Fetch diagram data
  const { data: diagram, isLoading: isDiagramLoading } = useQuery(diagramQueryOptions(diagramId));
  const { data: project, isLoading: isProjectLoading } = useQuery(projectQueryOptions(diagram?.projectId || ''));
  const { user } = useAuth();
  const { members, isLoading: isMembersLoading } = useProjectMembers(diagram?.projectId || '');
  
  const myMember = members?.find((m: any) => m.user.id === user?.id);
  const isOwner = project?.ownerId === user?.id;
  const userRole = isOwner ? 'OWNER' : myMember?.role || 'VIEWER';
  
  const isDataLoading = isDiagramLoading || (!!diagram?.projectId && (isProjectLoading || isMembersLoading));
  
  // Default to false while loading to allow initialization, then re-evaluate
  const isReadOnly = isDataLoading ? false : userRole === 'VIEWER';

  const [isShareOpen, setIsShareOpen] = useState(false);

  // Start empty — useEditorSync populates from DSL on mount
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);

  // Compute display nodes and edges based on showOnlyChanges filter
  const displayNodes = useMemo(() => {
    if (!showOnlyChanges) return nodes;
    return nodes.map((n) => {
      if (n.type === 'table') {
        const data = n.data as unknown as TableNodeData;
        const hasModifiedColumns = data.columns.some(
          c => c.reviewState === 'created' || c.reviewState === 'modified' || c.reviewState === 'deleted'
        );
        if ((data.reviewState === 'unchanged' || data.reviewState === 'published') && !hasModifiedColumns) {
          return { ...n, hidden: true };
        }
      }
      return n;
    });
  }, [nodes, showOnlyChanges]);

  const displayEdges = useMemo(() => {
    if (!showOnlyChanges) return edges;
    const visibleNodeIds = new Set(displayNodes.filter(n => !n.hidden).map(n => n.id));
    return edges.map((e) => {
      return {
        ...e,
        hidden: !visibleNodeIds.has(e.source) || !visibleNodeIds.has(e.target)
      };
    });
  }, [edges, displayNodes, showOnlyChanges]);

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
    },
    onEdgesChange: (newEdges) => {
      setEdges(newEdges);
    },
    onSync: (newNodes, newEdges) => {
      syncNodesToFeatureStores(newNodes, newEdges);
    },
    enabled: hasInitialized, // Always enable sync after init to load nodes!
    onDirty: () => setIsDirty(true),
  });

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((ns) => {
        const updated = applyNodeChanges(changes, ns);
        
        let shouldSync = false;
        for (const change of changes) {
          if (change.type === 'position' && change.dragging === false) {
            if (!isReadOnly) setIsDirty(true);
            shouldSync = true; // Drag ended
          } else if (
            change.type === 'add' ||
            change.type === 'remove' ||
            change.type === 'dimensions'
          ) {
            shouldSync = true;
          }
        }
        
        if (shouldSync && !isReadOnly) {
          syncNodesToFeatureStores(updated, edges);
        }
        return updated;
      });
    },
    [edges, isReadOnly],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((es) => {
        const updated = applyEdgeChanges(changes, es);
        if (!isReadOnly) {
          syncNodesToFeatureStores(nodes, updated);
        }
        return updated;
      });
    },
    [nodes, isReadOnly],
  );

  const { status: autosaveStatus, lastSavedAt, flush } = useCanvasAutosave({
    isDirty: isDirty && !isReadOnly,
    onSave: async () => {
      console.log('Explicit Save triggered! diagram:', !!diagram, 'isReadOnly:', isReadOnly, 'dslText length:', dslText.length);
      if (diagram && !isReadOnly) {
        console.log('Calling updateDiagram API...');
        await updateDiagram(diagramId, undefined, diagram.projectId, dslText);
        console.log('updateDiagram API call finished!');
      } else {
        console.log('Skipped API call. Diagram exists:', !!diagram, 'isReadOnly:', isReadOnly);
      }
      setIsDirty(false);
    },
  });

  // Keyboard shortcut: E to toggle editor sidebar, Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        flush();
        return;
      }
      
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
  }, [toggleSidebar, flush]);


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
        syncCanvasToEditor(newNodes, edges);
        return newNodes;
      });
      setIsDirty(true);
    },
    [edges, syncCanvasToEditor],
  );

  useEffect(() => {
    const handleColorChange = (e: CustomEvent<{ tableId: string; color: string }>) => {
      handleChangeTableColor(e.detail.tableId, e.detail.color);
    };
    window.addEventListener('canvas:change-table-color', handleColorChange as EventListener);
    return () => window.removeEventListener('canvas:change-table-color', handleColorChange as EventListener);
  }, [handleChangeTableColor]);

  useEffect(() => {
    const handleScrollToTable = (e: CustomEvent<string>) => {
      const tableName = e.detail;
      const node = nodes.find(n => n.type === 'table' && (n.data as unknown as TableNodeData).name === tableName);
      if (node) {
        const x = node.position.x + (node.width ?? 240) / 2;
        const y = node.position.y + (node.height ?? 200) / 2;
        setCenter(x, y, { zoom: 1, duration: 800 });
        selectMultipleTables([(node.data as unknown as TableNodeData).tableId]);
      }
    };
    window.addEventListener('canvas:scroll-to-table', handleScrollToTable as EventListener);
    return () => window.removeEventListener('canvas:scroll-to-table', handleScrollToTable as EventListener);
  }, [nodes, setCenter, selectMultipleTables]);

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

  if (isDataLoading || !hasInitialized) {
    return <div className="flex items-center justify-center w-full h-full text-muted-foreground">Loading diagram...</div>;
  }

  return (
    <div className="flex w-full h-full overflow-hidden">
      {isOpen && (
        <EditorPanel
          value={dslText}
          onChange={onDslChange}
          width={width}
          onWidthChange={setSidebarWidth}
          onSave={flush}
          isReadOnly={isReadOnly}
        />
      )}

      {/* Center: Canvas */}
      <div className="relative flex-1 overflow-hidden">
        <CanvasCore
          nodes={displayNodes}
          edges={displayEdges}
          nodesDraggable={!isReadOnly}
          nodesConnectable={!isReadOnly}
          isReadOnly={isReadOnly}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          {...(isReadOnly ? {} : {
            onConnect: handleConnect,
          })}
        />

        <CanvasToolbar
          {...(!isReadOnly && {
            onAddTable: handleAddTableFromToolbar,
            onAddNote: handleAddNoteFromToolbar,
            onPublish: async () => {
              const { publishDiagram } = await import('@/features/diagram/api/mutations');
              try {
                await publishDiagram(diagramId, diagram!.projectId);
                Toast.success('Diagram published successfully');
                queryClient.invalidateQueries({ queryKey: diagramKeys.byProject(diagram!.projectId) });
                window.location.reload();
              } catch (error: any) {
                Toast.error('Failed to publish diagram');
              }
            },
          })}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitView={handleFitView}
          isSidebarOpen={isOpen}
          onToggleSidebar={toggleSidebar}
          onSave={flush}
          {...(isOwner && {
            onShare: () => setIsShareOpen(true),
          })}
          showOnlyChanges={showOnlyChanges}
          onToggleShowChanges={() => setShowOnlyChanges(prev => !prev)}
        />

        {!isReadOnly && (
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
        )}

        <CanvasStatusBar
          nodeCount={tableCount}
          autosaveStatus={autosaveStatus}
          lastSavedAt={lastSavedAt}
        />

        {/* Top Right: Last Updated Info */}
        <div 
          className="absolute top-3 right-3 flex flex-col items-end gap-0.5 bg-card/80 backdrop-blur border border-border px-3 py-1.5 rounded-lg shadow-sm pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground font-medium truncate max-w-[200px]" title={diagram.name}>
              {diagram.name}
            </span>
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded uppercase tracking-wide">
              {diagram.versionTag}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {diagram.updatedByName && <span>By {diagram.updatedByName}</span>}
            <span>•</span>
            <span>{new Date(diagram.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Right: Properties panel */}
      {/* <PropertiesPanel /> */}

      {isShareOpen && project && (
        <ManageMembersModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          projectId={project.id}
          projectName={project.name}
          isOwner={isOwner}
        />
      )}
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
