import type { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ className = '', width, height, rounded = false }: SkeletonProps): ReactNode {
  return (
    <div
      className={`animate-pulse bg-muted ${rounded ? 'rounded-full' : 'rounded-md'} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
