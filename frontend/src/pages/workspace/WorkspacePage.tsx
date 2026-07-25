import { useParams } from 'react-router-dom';
import type { ReactNode } from 'react';

export function WorkspacePage(): ReactNode {
  const { diagramId } = useParams<{ diagramId: string }>();

  return (
    <div className="flex items-center justify-center h-screen bg-canvas">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Workspace</h1>
        <p className="text-muted-foreground">Diagram: {diagramId}</p>
        <p className="text-muted-foreground text-sm mt-2">Canvas coming soon.</p>
      </div>
    </div>
  );
}
