import { memo, type ReactNode } from 'react';

interface RelationshipSelectionProps {
  edgePath: string;
  isSelected: boolean;
}

export const RelationshipSelection = memo(function RelationshipSelection({
  edgePath,
  isSelected,
}: RelationshipSelectionProps): ReactNode {
  if (!isSelected) return null;

  return (
    <path
      d={edgePath}
      fill="none"
      stroke="hsl(var(--selected))"
      strokeWidth={4}
      strokeOpacity={0.3}
      className="pointer-events-none"
    />
  );
});
