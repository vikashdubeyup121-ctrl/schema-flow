import { memo, type ReactNode, type ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export const IconButton = memo(function IconButton({
  label,
  children,
  className = '',
  ...rest
}: IconButtonProps): ReactNode {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
});
