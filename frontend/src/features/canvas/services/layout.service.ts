import dagre from 'dagre';
import type { Node, Edge } from '@/lib/reactflow';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Rough estimates for node sizes based on tables/columns
const NODE_WIDTH = 250;
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 50;

function estimateNodeHeight(node: Node): number {
  if (node.type === 'note') return 150;
  
  // Table node
  const cols = node.data?.columns?.length || 0;
  return HEADER_HEIGHT + cols * ROW_HEIGHT + 20; // + padding
}

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'LR'
): { nodes: Node[]; edges: Edge[] } => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 200 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: NODE_WIDTH, 
      height: estimateNodeHeight(node) 
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = { ...node };

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    newNode.position = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - estimateNodeHeight(node) / 2,
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};
