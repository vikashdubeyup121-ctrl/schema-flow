import { useEffect, useRef, useCallback } from 'react';
import type { Node, Edge } from '@/lib/reactflow';
import { useEditorStore } from '../stores/editor.store';
import { parseDsl } from '../services/dslParser.service';
import { dslAstToCanvasNodes } from '../services/dslToCanvas.service';
import { serializeToDsl } from '../services/dslSerializer.service';

const DSL_DEBOUNCE_MS = 600;

interface UseEditorSyncOptions {
  nodes: Node[];
  edges: Edge[];
  publishedDslText?: string | null;
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onSync?: (nodes: Node[], edges: Edge[]) => void;
  enabled?: boolean;
  onDirty?: () => void;
}

interface UseEditorSyncReturn {
  dslText: string;
  onDslChange: (text: string) => void;
  syncCanvasToEditor: (nodes: Node[], edges: Edge[]) => void;
}

export function useEditorSync(options: UseEditorSyncOptions): UseEditorSyncReturn {
  const { dslText, setDslText } = useEditorStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Prevents circular updates: editor → canvas → editor
  const isSyncingFromEditorRef = useRef(false);
  const isSyncingFromCanvasRef = useRef(false);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Editor text changed → parse → update canvas (debounced)
  const onDslChange = useCallback(
    (text: string) => {
      setDslText(text);
      if (optionsRef.current.onDirty) optionsRef.current.onDirty();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (isSyncingFromCanvasRef.current) return;
        isSyncingFromEditorRef.current = true;
        try {
          const ast = parseDsl(text);
          const publishedAst = optionsRef.current.publishedDslText ? parseDsl(optionsRef.current.publishedDslText) : undefined;
          const { nodes: newNodes, edges: newEdges } = dslAstToCanvasNodes(ast, optionsRef.current.nodes, optionsRef.current.edges, publishedAst);
          optionsRef.current.onNodesChange(newNodes);
          optionsRef.current.onEdgesChange(newEdges);
          if (optionsRef.current.onSync) optionsRef.current.onSync(newNodes, newEdges);
        } finally {
          isSyncingFromEditorRef.current = false;
        }
      }, DSL_DEBOUNCE_MS);
    },
    [setDslText],
  );

  // Canvas changed externally (toolbar add table, etc.) → serialize → update editor text
  const syncCanvasToEditor = useCallback(
    (updatedNodes: Node[], updatedEdges: Edge[]) => {
      if (isSyncingFromEditorRef.current) return;
      isSyncingFromCanvasRef.current = true;
      try {
        const newDsl = serializeToDsl(updatedNodes, updatedEdges);
        setDslText(newDsl);
      } finally {
        isSyncingFromCanvasRef.current = false;
      }
    },
    [setDslText],
  );

  // Sync canvas from the initial DSL on first mount or when enabled becomes true
  useEffect(() => {
    if (options.enabled === false) return;
    
    isSyncingFromEditorRef.current = true;
    try {
      // Use the latest dslText from store but only run this once on enable
      const currentDsl = useEditorStore.getState().dslText;
      const ast = parseDsl(currentDsl);
      const publishedAst = optionsRef.current.publishedDslText ? parseDsl(optionsRef.current.publishedDslText) : undefined;
      const { nodes: newNodes, edges: newEdges } = dslAstToCanvasNodes(ast, [], [], publishedAst);
      optionsRef.current.onNodesChange(newNodes);
      optionsRef.current.onEdgesChange(newEdges);
      if (optionsRef.current.onSync) optionsRef.current.onSync(newNodes, newEdges);
    } finally {
      isSyncingFromEditorRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.enabled]);

  return { dslText, onDslChange, syncCanvasToEditor };
}
