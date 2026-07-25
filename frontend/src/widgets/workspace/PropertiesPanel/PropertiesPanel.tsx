import { memo, type ReactNode } from 'react';
import { useCanvasSelectionStore } from '@/features/canvas/stores/canvasSelection.store';
import { TableInspector } from './TableInspector/TableInspector';
import { RelationshipInspector } from './RelationshipInspector/RelationshipInspector';
import { NoteInspector } from './NoteInspector/NoteInspector';
import { WorkspaceInspector } from './WorkspaceInspector/WorkspaceInspector';
import { EmptySelection } from './EmptySelection/EmptySelection';

function useInspectorTarget(): { kind: 'table'; id: string } | { kind: 'relationship'; id: string } | { kind: 'note'; id: string } | { kind: 'workspace' } {
  const primaryTableId = useCanvasSelectionStore((s) => s.primarySelectedTableId());
  const primaryRelId = useCanvasSelectionStore((s) => s.primarySelectedRelationshipId());
  const primaryNoteId = useCanvasSelectionStore((s) => s.primarySelectedNoteId());

  if (primaryRelId) return { kind: 'relationship', id: primaryRelId };
  if (primaryTableId) return { kind: 'table', id: primaryTableId };
  if (primaryNoteId) return { kind: 'note', id: primaryNoteId };
  return { kind: 'workspace' };
}

function InspectorLabel({ kind }: { kind: string }): ReactNode {
  const labels: Record<string, string> = {
    table: 'Table',
    relationship: 'Relationship',
    note: 'Note',
    workspace: 'Workspace',
  };
  return <>{labels[kind] ?? 'Properties'}</>;
}

export const PropertiesPanel = memo(function PropertiesPanel(): ReactNode {
  const target = useInspectorTarget();
  const hasSelection = useCanvasSelectionStore((s) => s.hasSelection());

  return (
    <div
      className="flex flex-col h-full bg-card border-l border-border overflow-hidden shrink-0"
      style={{ width: 340 }}
    >
      {/* Header */}
      <div className="flex items-center px-4 h-10 border-b border-border shrink-0">
        <span className="text-sm font-semibold text-foreground">
          <InspectorLabel kind={target.kind} />
        </span>
      </div>

      {/* Inspector content */}
      {!hasSelection ? (
        <EmptySelection />
      ) : target.kind === 'table' ? (
        <TableInspector tableId={target.id} />
      ) : target.kind === 'relationship' ? (
        <RelationshipInspector relationshipId={target.id} />
      ) : target.kind === 'note' ? (
        <NoteInspector noteId={target.id} />
      ) : (
        <WorkspaceInspector />
      )}
    </div>
  );
});
