import { memo, type ReactNode } from 'react';
import { Spinner } from '@/shared/components/Spinner';

interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
}

export const LoadingOverlay = memo(function LoadingOverlay({
  visible,
  label = 'Loading...',
}: LoadingOverlayProps): ReactNode {
  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm z-50"
      aria-live="polite"
      aria-label={label}
    >
      <Spinner size="lg" label={label} />
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
});
