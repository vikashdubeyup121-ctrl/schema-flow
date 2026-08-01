import { memo, useState, useRef, useCallback, type ReactNode, type MouseEvent } from 'react';
import { IconButton } from '@/shared/components';
import { EditIcon, SettingsIcon } from '@/shared/icons';
import { TABLE_COLORS } from '@/features/canvas/constants/canvas.constants';
import { useClickOutside } from '@/shared/hooks';

interface NoteHeaderProps {
  title: string;
  color?: string | undefined;
  isEditing: boolean;
  onEditClick: (e: MouseEvent) => void;
  onHeaderDoubleClick: (e: MouseEvent) => void;
  onColorPreview: (color: string) => void;
  onColorSubmit: (color: string) => void;
}

export const NoteHeader = memo(function NoteHeader({
  title,
  color,
  isEditing,
  onEditClick,
  onHeaderDoubleClick,
  onColorPreview,
  onColorSubmit,
}: NoteHeaderProps): ReactNode {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  useClickOutside(settingsRef, () => setIsSettingsOpen(false));

  const handleToggleSettings = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    setIsSettingsOpen((prev) => !prev);
  }, []);

  return (
    <div
      onDoubleClick={onHeaderDoubleClick}
      className="flex items-center justify-between px-2 shrink-0 cursor-pointer"
      style={{
        height: 28,
        borderBottom: '1px solid hsl(var(--border))',
        background: color ?? 'hsl(var(--surface))',
      }}
    >
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium truncate" style={{ color: color ? '#ffffff' : undefined }}>
        {title}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover/note:opacity-100 transition-all">
        <div ref={settingsRef} className="relative">
          <IconButton
            label="Change color"
            onClick={handleToggleSettings}
            className="p-0.5"
            style={{ color: color ? 'rgba(255,255,255,0.8)' : undefined }}
          >
            <SettingsIcon size={12} />
          </IconButton>

          {isSettingsOpen && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl p-2 z-50 flex flex-col gap-2 nodrag" onDoubleClick={(e) => e.stopPropagation()}>
              <div className="flex gap-1">
                {TABLE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={(e) => {
                      e.stopPropagation();
                      onColorSubmit(c);
                      setIsSettingsOpen(false);
                    }}
                    className={`w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform ${color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-card' : ''}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs text-muted-foreground font-medium">Hex</span>
                <input
                  type="text"
                  value={color ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onColorPreview(val);
                  }}
                  onBlur={(e) => {
                    onColorSubmit(e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      onColorSubmit((e.target as HTMLInputElement).value);
                      setIsSettingsOpen(false);
                    }
                  }}
                  className="w-full bg-background border border-border rounded px-2 py-0.5 text-xs text-foreground outline-none focus:border-primary"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>
        {!isEditing && (
          <IconButton
            label="Edit note"
            onClick={onEditClick}
            className="p-0.5"
            style={{ color: color ? 'rgba(255,255,255,0.8)' : undefined }}
          >
            <EditIcon size={12} />
          </IconButton>
        )}
      </div>
    </div>
  );
});
