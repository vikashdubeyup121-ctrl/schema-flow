import { memo, type ReactNode } from 'react';

interface RelationshipArrowProps {
  cx: number;
  cy: number;
  side: 'source' | 'target';
  isMany: boolean;
}

export const RelationshipArrow = memo(function RelationshipArrow({
  cx,
  cy,
  side,
  isMany,
}: RelationshipArrowProps): ReactNode {
  const size = 10;
  const offset = side === 'source' ? -size : size;

  if (isMany) {
    // Crow's foot marker
    return (
      <g transform={`translate(${cx}, ${cy})`}>
        <line x1={offset} y1={-size / 2} x2={0} y2={0} stroke="currentColor" strokeWidth={1.5} />
        <line x1={offset} y1={size / 2} x2={0} y2={0} stroke="currentColor" strokeWidth={1.5} />
        <line x1={offset} y1={0} x2={0} y2={0} stroke="currentColor" strokeWidth={1.5} />
      </g>
    );
  }

  // Single bar marker
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <line x1={0} y1={-size / 2} x2={0} y2={size / 2} stroke="currentColor" strokeWidth={1.5} />
    </g>
  );
});
