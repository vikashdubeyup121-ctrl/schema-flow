import { memo, type ReactNode } from 'react';
import { useTableStore } from '@/features/table/stores/table.store';
import { useRelationshipStore } from '@/features/relationship/stores/relationship.store';
import { useNoteStore } from '@/features/note/stores/note.store';
import { PropertySection } from '../PropertySection/PropertySection';
import { PropertyRow } from '../PropertyRow/PropertyRow';

export const WorkspaceInspector = memo(function WorkspaceInspector(): ReactNode {
  const tableCount = useTableStore((s) => Object.keys(s.tables).length);
  const relationshipCount = useRelationshipStore((s) => Object.keys(s.relationships).length);
  const noteCount = useNoteStore((s) => Object.keys(s.notes).length);

  return (
    <div className="flex flex-col overflow-y-auto flex-1">
      <PropertySection title="Statistics">
        <PropertyRow label="Tables">
          <span className="text-sm text-foreground">{tableCount}</span>
        </PropertyRow>
        <PropertyRow label="Relationships">
          <span className="text-sm text-foreground">{relationshipCount}</span>
        </PropertyRow>
        <PropertyRow label="Notes">
          <span className="text-sm text-foreground">{noteCount}</span>
        </PropertyRow>
      </PropertySection>
    </div>
  );
});
