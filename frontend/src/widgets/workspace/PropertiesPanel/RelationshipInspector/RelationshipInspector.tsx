import { memo, useCallback, type ReactNode } from 'react';
import { useRelationshipStore } from '@/features/relationship/stores/relationship.store';
import { useTableStore } from '@/features/table/stores/table.store';
import { REVIEW_STATE_COLORS } from '@/features/canvas/constants/canvas.constants';
import type { RelationshipType } from '@/features/canvas/types/Canvas';
import { PropertySection } from '../PropertySection/PropertySection';
import { PropertyRow } from '../PropertyRow/PropertyRow';

interface RelationshipInspectorProps {
  relationshipId: string;
}

const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  ONE_TO_ONE: 'One to One',
  ONE_TO_MANY: 'One to Many',
  MANY_TO_ONE: 'Many to One',
};

const RELATIONSHIP_TYPES: RelationshipType[] = ['ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_ONE'];

export const RelationshipInspector = memo(function RelationshipInspector({
  relationshipId,
}: RelationshipInspectorProps): ReactNode {
  const relationship = useRelationshipStore((s) => s.relationships[relationshipId]);
  const updateRelationship = useRelationshipStore((s) => s.updateRelationship);
  const sourceTable = useTableStore((s) =>
    relationship ? s.tables[relationship.sourceTableId] : undefined,
  );
  const targetTable = useTableStore((s) =>
    relationship ? s.tables[relationship.targetTableId] : undefined,
  );

  const handleTypeChange = useCallback(
    (type: RelationshipType) => {
      updateRelationship(relationshipId, { relationshipType: type });
    },
    [relationshipId, updateRelationship],
  );

  if (!relationship) return null;

  const reviewColor = REVIEW_STATE_COLORS[relationship.reviewState];

  return (
    <div className="flex flex-col overflow-y-auto flex-1">
      <PropertySection title="Relationship">
        <PropertyRow label="Type">
          <div className="flex flex-col gap-1">
            {RELATIONSHIP_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                  relationship.relationshipType === type
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-surface-hover'
                }`}
              >
                {RELATIONSHIP_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Connections">
        <PropertyRow label="Source">
          <span className="text-sm text-foreground">
            {sourceTable?.name ?? relationship.sourceTableId}
          </span>
        </PropertyRow>
        <PropertyRow label="Target">
          <span className="text-sm text-foreground">
            {targetTable?.name ?? relationship.targetTableId}
          </span>
        </PropertyRow>
      </PropertySection>

      <PropertySection title="Review" defaultOpen={false}>
        <PropertyRow label="State">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: reviewColor }}
            />
            <span className="text-sm text-foreground capitalize">{relationship.reviewState}</span>
          </div>
        </PropertyRow>
      </PropertySection>
    </div>
  );
});
