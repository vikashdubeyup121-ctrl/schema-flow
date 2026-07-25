import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'danger' | 'warning';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary text-secondary-foreground border-border',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps): ReactNode {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
