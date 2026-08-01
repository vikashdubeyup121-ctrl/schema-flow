// @ts-nocheck
import { useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
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
import { DEFAULT_DSL } from '@/features/editor/stores/editor.store';
import { syncNodesToFeatureStores } from '@/features/canvas/services';
import { useTableStore } from '@/features/table/stores/table.store';
import { useColumnStore } from '@/features/column/stores/column.store';
import { useNoteStore } from '@/features/note/stores/note.store';
import { useRelationshipStore } from '@/features/relationship/stores/relationship.store';
import { ImportSchemaModal } from '@/features/editor/components/ImportSchemaModal';
import { ExportSchemaModal } from '@/features/export';
import { Save, Upload, Share2, Download } from 'lucide-react';
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
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as unknown as HTMLElement)) {
        setIsMenuOpen(false);
      }
    }
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isMenuOpen]);

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
        // If it's a completely new diagram, reset the global store to DEFAULT_DSL
        // so we don't accidentally inherit the DSL text from the last viewed diagram!
        setDslText(DEFAULT_DSL);
        setIsDirty(true);
      }
      setHasInitialized(true);
    }
  }, [diagram, hasInitialized, setDslText]);

  const { dslText, onDslChange, syncCanvasToEditor } = useEditorSync({
    nodes,
    edges,
    publishedDslText: diagram?.publishedDslText ?? null,
    nodesData: diagram?.nodesData,
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
          syncNodesToFeatureStores(updated, edges, 'geometry');
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
          syncNodesToFeatureStores(nodes, updated, 'geometry');
        }
        return updated;
      });
    },
    [nodes, isReadOnly],
  );

  const { status: autosaveStatus, lastSavedAt, flush } = useCanvasAutosave({
    isDirty: isDirty && !isReadOnly,
    onSave: async () => {
      if (diagram && !isReadOnly) {
        const nodesData: Record<string, {x: number, y: number}> = {};
        nodes.forEach((n) => {
          if (n.type === 'table' || n.type === 'note') {
            const data = n.data as any;
            const key = n.type === 'table' ? data.name : data.noteId;
            if (key) {
              nodesData[key] = { x: Math.round(n.position.x), y: Math.round(n.position.y) };
            }
          }
        });
        await updateDiagram(diagramId, undefined, diagram.projectId, dslText, nodesData);
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
      syncNodesToFeatureStores(nodes, newEdges, 'geometry');
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
      syncNodesToFeatureStores(newNodes, edges, 'geometry');
      setIsDirty(true);
    },
    [nodes, edges, syncCanvasToEditor],
  );

  const handleAddNote = useCallback(
    (position: Point) => {
      const count = useNoteStore.getState().getAllNotes().length + 1;
      const title = `Note_${count}`;
      const id = `note-${title}`;
      const colorIndex = Math.floor(Math.random() * TABLE_COLORS.length);
      const noteData = {
        noteId: id,
        title: title,
        color: TABLE_COLORS[colorIndex] ?? TABLE_COLORS[0],
        content: '',
        reviewState: 'created',
        width: CANVAS.NOTE_DEFAULT_WIDTH,
        height: CANVAS.NOTE_DEFAULT_HEIGHT,
      } as const;

      useNoteStore.getState().addNote({
        id,
        versionId: 'local',
        ...noteData
      });

      const newNode: Node = {
        id,
        type: 'note',
        position,
        data: noteData,
        style: { width: CANVAS.NOTE_DEFAULT_WIDTH },
      };
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      syncCanvasToEditor(newNodes, edges);
      syncNodesToFeatureStores(newNodes, edges, 'geometry');
      setIsDirty(true);
    },
    [nodes, edges, syncCanvasToEditor],
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

  const _handleAddTableFromContextMenu = useCallback(() => {
    const position = screenToFlowPosition({ x: menuX, y: menuY });
    handleAddTable(position);
  }, [screenToFlowPosition, menuX, menuY, handleAddTable]);

  const _handleAddNoteFromContextMenu = useCallback(() => {
    const position = screenToFlowPosition({ x: menuX, y: menuY });
    handleAddNote(position);
  }, [screenToFlowPosition, menuX, menuY, handleAddNote]);

  const _handleDeleteTarget = useCallback(
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

  const _handleRenameTable = useCallback(
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

  const handleChangeNoteColor = useCallback(
    (noteId: string, color: string) => {
      setNodes((ns) => {
        const newNodes = ns.map((n) => {
          if (n.id === noteId && n.type === 'note') {
            const data = n.data as unknown as NoteNodeData;
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
    const handleNoteColorChange = (e: CustomEvent<{ noteId: string; color: string }>) => {
      handleChangeNoteColor(e.detail.noteId, e.detail.color);
    };
    window.addEventListener('canvas:change-table-color', handleColorChange as EventListener);
    window.addEventListener('canvas:change-note-color', handleNoteColorChange as EventListener);
    return () => {
      window.removeEventListener('canvas:change-table-color', handleColorChange as EventListener);
      window.removeEventListener('canvas:change-note-color', handleNoteColorChange as EventListener);
    };
  }, [handleChangeTableColor, handleChangeNoteColor]);

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
    
    const handleScrollToNote = (e: CustomEvent<string>) => {
      const title = e.detail;
      const node = nodes.find(n => n.type === 'note' && (n.data as unknown as NoteNodeData).title === title);
      if (node) {
        const x = node.position.x + (node.width ?? 250) / 2;
        const y = node.position.y + (node.height ?? 200) / 2;
        setCenter(x, y, { zoom: 1, duration: 800 });
      }
    };

    window.addEventListener('canvas:scroll-to-table', handleScrollToTable as EventListener);
    window.addEventListener('canvas:scroll-to-note', handleScrollToNote as EventListener);
    return () => {
      window.removeEventListener('canvas:scroll-to-table', handleScrollToTable as EventListener);
      window.removeEventListener('canvas:scroll-to-note', handleScrollToNote as EventListener);
    };
  }, [nodes, setCenter, selectMultipleTables]);

  const _handleChangeRelationshipType = useCallback(
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

  const _handleSelectAll = useCallback(() => {
    const tableIds = nodes
      .filter((n) => n.type === 'table')
      .map((n) => (n.data as unknown as TableNodeData).tableId);
    selectMultipleTables(tableIds);
  }, [nodes, selectMultipleTables]);

  const handleFitView = useCallback(() => {
    fitView({ duration: 300 });
  }, [fitView]);

  const handleAutoLayout = useCallback(async (direction: string) => {
    const { getLayoutedElements } = await import('@/features/canvas/services/layout.service');
    const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(nodes, edges, direction as any);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    syncCanvasToEditor(layoutedNodes, layoutedEdges);
    syncNodesToFeatureStores(layoutedNodes, layoutedEdges, 'geometry');
    setIsDirty(true);
    setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 50);
  }, [nodes, edges, fitView, syncCanvasToEditor]);

  // Synchronize changes from Note store back to Editor DSL
  // (e.g. when user edits note content)
  useEffect(() => {
    if (isReadOnly) return;
    const handleNoteChange = () => {
      setIsDirty(true);
      // We sync using the current nodes and edges
      setNodes((currentNodes) => {
        setEdges((currentEdges) => {
          syncCanvasToEditor(currentNodes, currentEdges);
          return currentEdges;
        });
        return currentNodes;
      });
    };
    window.addEventListener('canvas:note-changed', handleNoteChange as EventListener);
    return () => window.removeEventListener('canvas:note-changed', handleNoteChange as EventListener);
  }, [isReadOnly, syncCanvasToEditor]);

  const _tableCount = nodes.filter((n) => n.type === 'table').length;

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

        {!isReadOnly && (
          <CanvasContextMenu
            onAddTable={_handleAddTableFromContextMenu}
            onAddNote={_handleAddNoteFromContextMenu}
            onDeleteTarget={_handleDeleteTarget}
            onSelectAll={_handleSelectAll}
            onFitView={handleFitView}
            onRenameTable={_handleRenameTable}
            onChangeTableColor={handleChangeTableColor}
            onChangeNoteColor={handleChangeNoteColor}
            onChangeRelationshipType={_handleChangeRelationshipType}
          />
        )}

        {/* Top Floating Controls */}
        <div 
          className="absolute top-3 inset-x-3 flex items-start pointer-events-none gap-4"
          style={{ zIndex: 10 }}
        >
          {/* Left Column: Spacer to push center exactly into the middle */}
          <div className="flex-1 min-w-0" />

          {/* Center Column: Toolbar (Fixed Width) */}
          <div className="shrink-0 pointer-events-auto flex justify-center">
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
                    queryClient.invalidateQueries({ queryKey: diagramKeys.detail(diagramId) });
                  } catch (error: any) {
                    Toast.error('Failed to publish diagram');
                  }
                },
                onAutoLayout: handleAutoLayout,
              })}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onFitView={handleFitView}
              isSidebarOpen={isOpen}
              onToggleSidebar={toggleSidebar}
              showOnlyChanges={showOnlyChanges}
              onToggleShowChanges={() => setShowOnlyChanges(prev => !prev)}
            />
          </div>

          {/* Right Column: Actions & Metadata (Shrinks to prevent overlap) */}
          <div className="flex-1 min-w-0 flex justify-end items-start gap-2 pointer-events-auto">
            {/* Metadata */}
            {diagram && (
              <div className="flex flex-col justify-center items-end gap-0.5 bg-card/80 backdrop-blur border border-border px-3 h-10 rounded-lg shadow-sm pointer-events-none min-w-0">
                <div className="flex items-center gap-2 max-w-full">
                  <span className="text-xs text-foreground font-medium truncate" title={diagram.name}>
                    {diagram.name}
                  </span>
                  <span className="shrink-0 w-[76px] text-center whitespace-nowrap px-1 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded uppercase tracking-wide">
                    {diagram.versionTag}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap max-w-full">
                  {diagram.updatedByName && (
                    <span className="truncate" title={`By ${diagram.updatedByName}`}>
                      By {diagram.updatedByName}
                    </span>
                  )}
                  <span className="shrink-0">•</span>
                  <span className="shrink-0">{new Date(diagram.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            )}

            {/* Action Menu Dropdown */}
            <div className="relative shrink-0" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center justify-center gap-1.5 px-3 h-10 bg-card/80 backdrop-blur border border-border rounded-lg shadow-sm hover:bg-surface-hover text-foreground text-xs font-semibold"
                >
                  Menu
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg py-1 text-xs text-foreground z-50">
                    {!isReadOnly && (
                      <button onClick={() => { flush(); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-surface-hover font-medium">
                        <Save size={14} className="text-muted-foreground" />
                        Save Changes
                      </button>
                    )}
                    {!isReadOnly && (
                      <button onClick={() => { setIsImportOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-surface-hover font-medium">
                        <Upload size={14} className="text-muted-foreground" />
                        Import Schema
                      </button>
                    )}
                    {!isReadOnly && (
                      <button onClick={() => { setIsExportOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-surface-hover font-medium">
                        <Download size={14} className="text-muted-foreground" />
                        Export Schema
                      </button>
                    )}
                    {isOwner && (
                      <button onClick={() => { setIsShareOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-surface-hover font-medium">
                        <Share2 size={14} className="text-muted-foreground" />
                        Share Project
                      </button>
                    )}
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Bottom Floating Status Bar */}
        <CanvasStatusBar
          nodeCount={nodes.filter(n => n.type === 'table').length}
          autosaveStatus={autosaveStatus}
          lastSavedAt={lastSavedAt}
        />
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

      {isImportOpen && (
        <ImportSchemaModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          diagramId={diagramId}
          onSuccess={(res) => {
            queryClient.invalidateQueries({ queryKey: diagramKeys.detail(diagramId) });
            const dsl = res?.data?.dslText;
            if (dsl) {
              onDslChange(dsl);
            }
          }}
        />
      )}

      {isExportOpen && (
        <ExportSchemaModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          dslText={dslText}
          diagramName={diagram?.name || 'diagram'}
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
      <WorkspaceCanvasInner key={diagramId} diagramId={diagramId} />
    </ReactFlowProvider>
  );
}
