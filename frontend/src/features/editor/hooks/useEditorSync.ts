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
}

interface UseEditorSyncReturn {
  dslText: string;
  onDslChange: (text: string) => void;
  syncCanvasToEditor: (nodes: Node[], edges: Edge[]) => void;
}

export function useEditorSync({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}: UseEditorSyncOptions): UseEditorSyncReturn {
  const { dslText, setDslText } = useEditorStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Prevents circular updates: editor → canvas → editor
  const isSyncingFromEditorRef = useRef(false);
  const isSyncingFromCanvasRef = useRef(false);

  // Editor text changed → parse → update canvas (debounced)
  const onDslChange = useCallback(
    (text: string) => {
      setDslText(text);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (isSyncingFromCanvasRef.current) return;
        isSyncingFromEditorRef.current = true;
        try {
          const ast = parseDsl(text);
          const { nodes: newNodes, edges: newEdges } = dslAstToCanvasNodes(ast, nodes, edges);
          onNodesChange(newNodes);
          onEdgesChange(newEdges);
        } finally {
          isSyncingFromEditorRef.current = false;
        }
      }, DSL_DEBOUNCE_MS);
    },
    [setDslText, nodes, edges, onNodesChange, onEdgesChange],
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

  // Sync canvas from the initial DSL on first mount
  useEffect(() => {
    isSyncingFromEditorRef.current = true;
    try {
      const ast = parseDsl(dslText);
      const { nodes: newNodes, edges: newEdges } = dslAstToCanvasNodes(ast, [], []);
      onNodesChange(newNodes);
      onEdgesChange(newEdges);
    } finally {
      isSyncingFromEditorRef.current = false;
    }
    // Intentionally only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { dslText, onDslChange, syncCanvasToEditor };
}
