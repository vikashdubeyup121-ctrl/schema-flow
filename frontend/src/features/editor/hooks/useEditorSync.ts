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
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
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
          const { nodes: newNodes, edges: newEdges } = dslAstToCanvasNodes(ast, optionsRef.current.nodes, optionsRef.current.edges);
          optionsRef.current.onNodesChange(newNodes);
          optionsRef.current.onEdgesChange(newEdges);
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
      const ast = parseDsl(dslText);
      const { nodes: newNodes, edges: newEdges } = dslAstToCanvasNodes(ast, [], []);
      optionsRef.current.onNodesChange(newNodes);
      optionsRef.current.onEdgesChange(newEdges);
    } finally {
      isSyncingFromEditorRef.current = false;
    }
  }, [options.enabled]);

  return { dslText, onDslChange, syncCanvasToEditor };
}
