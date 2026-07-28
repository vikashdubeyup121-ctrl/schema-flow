import dagre from 'dagre';
import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from '@/lib/reactflow';

const elk = new ELK();

// Rough estimates for node sizes based on tables/columns
const NODE_WIDTH = 250;
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 50;

function estimateNodeHeight(node: Node): number {
  if (node.type === 'note') return 150;
  
  // Table node
  const cols = (node.data as any)?.columns?.length || 0;
  return HEADER_HEIGHT + cols * ROW_HEIGHT + 20; // + padding
}

export const getLayoutedElements = async (
  nodes: Node[],
  edges: Edge[],
  algorithmAndDirection: string = 'dagre-LR'
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  const [algo, direction] = algorithmAndDirection.split('-');

  if (algo === 'elk') {
    const elkNodes = nodes.map((n) => ({
      id: n.id,
      width: NODE_WIDTH,
      height: estimateNodeHeight(n),
    }));

    const elkEdges = edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    }));

    const graph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': direction === 'TB' ? 'DOWN' : 'RIGHT',
        'elk.spacing.nodeNode': '100',
        'elk.layered.spacing.nodeNodeBetweenLayers': '200',
      },
      children: elkNodes,
      edges: elkEdges,
    };

    const layoutedGraph = await elk.layout(graph);
    
    const newNodes = nodes.map((node) => {
      const elkNode = layoutedGraph.children?.find((n: any) => n.id === node.id);
      return {
        ...node,
        position: {
          x: elkNode?.x ?? node.position.x,
          y: elkNode?.y ?? node.position.y,
        },
      };
    });

    return { nodes: newNodes, edges };
  } else {
    // Dagre
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
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
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - NODE_WIDTH / 2,
          y: nodeWithPosition.y - estimateNodeHeight(node) / 2,
        },
      };
    });

    return { nodes: newNodes, edges };
  }
};
