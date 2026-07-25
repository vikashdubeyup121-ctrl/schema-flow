import { forwardRef, type InputHTMLAttributes } from 'react';
import { SearchIcon, CloseIcon } from '@/shared/icons';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = 'Search...', className = '', ...rest }, ref) => {
    return (
      <div className={`relative flex items-center ${className}`}>
        <SearchIcon
          size={14}
          className="absolute left-2.5 text-muted-foreground pointer-events-none"
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface border border-border rounded-md py-1.5 pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          {...rest}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';

export type { SearchInputProps };
