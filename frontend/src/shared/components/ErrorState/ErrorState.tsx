import type { ReactNode } from 'react';
import { ErrorIcon } from '@/shared/icons';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred.',
  onRetry,
}: ErrorStateProps): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="text-danger mb-4">
        <ErrorIcon size={32} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-primary hover:underline"
          aria-label="Retry"
        >
          Try again
        </button>
      )}
    </div>
  );
}
