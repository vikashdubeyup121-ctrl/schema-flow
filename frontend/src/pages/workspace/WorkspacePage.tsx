import { useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { WorkspaceCanvas } from '@/widgets/workspaceCanvas';
import { AppHeader } from '@/shared/components/layout/AppHeader';

export function WorkspacePage(): ReactNode {
  const { diagramId } = useParams<{ diagramId: string }>();

  if (!diagramId) {
    return (
      <div className="flex items-center justify-center h-screen bg-canvas">
        <p className="text-muted-foreground">No diagram selected.</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      <AppHeader />
      <WorkspaceCanvas diagramId={diagramId} />
    </div>
  );
}
