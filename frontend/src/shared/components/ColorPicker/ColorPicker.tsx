import { memo, type ReactNode } from 'react';

interface ColorPickerProps {
  value: string;
  options: readonly string[];
  onChange: (color: string) => void;
}

export const ColorPicker = memo(function ColorPicker({
  value,
  options,
  onChange,
}: ColorPickerProps): ReactNode {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color picker">
      {options.map((color) => (
        <button
          key={color}
          role="radio"
          aria-checked={value === color}
          aria-label={color}
          onClick={() => onChange(color)}
          className="w-6 h-6 rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            backgroundColor: color,
            borderColor: value === color ? 'hsl(var(--foreground))' : 'transparent',
          }}
        />
      ))}
    </div>
  );
});
