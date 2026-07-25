import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { SpinnerIcon } from '@/shared/icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border',
  ghost:
    'bg-transparent text-foreground hover:bg-surface-hover border-transparent',
  danger:
    'bg-danger text-danger-foreground hover:bg-danger/90 border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      disabled,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled ?? isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-medium rounded-md border
          transition-colors focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...rest}
      >
        {isLoading ? (
          <SpinnerIcon size={14} className="animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
      </button>
    );
  },
);
