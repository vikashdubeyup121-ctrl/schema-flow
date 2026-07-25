import type { ReactNode } from 'react';
import { UserIcon } from '@/shared/icons';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

const iconSizes = {
  sm: 12,
  md: 16,
  lg: 20,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps): ReactNode {
  const sizeClass = sizeClasses[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'User avatar'}
        className={`rounded-full object-cover ${sizeClass} ${className}`}
      />
    );
  }

  if (name) {
    return (
      <div
        className={`rounded-full bg-secondary flex items-center justify-center font-medium text-secondary-foreground ${sizeClass} ${className}`}
        aria-label={name}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-secondary flex items-center justify-center text-muted-foreground ${sizeClass} ${className}`}
      aria-label="Unknown user"
    >
      <UserIcon size={iconSizes[size]} />
    </div>
  );
}
