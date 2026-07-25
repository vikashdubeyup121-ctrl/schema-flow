import { memo, type ReactNode } from 'react';
import type { ReviewState } from '@/features/canvas/types/Canvas';
import { REVIEW_STATE_COLORS } from '@/features/canvas/constants/canvas.constants';

const REVIEW_LABELS: Record<ReviewState, string | null> = {
  published: null,
  unchanged: null,
  created: 'New',
  modified: 'Modified',
  deleted: 'Deleted',
};

interface ReviewIndicatorProps {
  reviewState: ReviewState;
  className?: string;
}

export const ReviewIndicator = memo(function ReviewIndicator({
  reviewState,
  className = '',
}: ReviewIndicatorProps): ReactNode {
  const label = REVIEW_LABELS[reviewState];
  if (!label) return null;

  const color = REVIEW_STATE_COLORS[reviewState];

  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded uppercase leading-none ${className}`}
      style={{ color, backgroundColor: `${color}20` }}
      aria-label={`Review state: ${label}`}
    >
      {label}
    </span>
  );
});
