import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useClickOutside } from '@/shared/hooks';
import { useCanvasContextMenuStore } from '../../stores/canvasContextMenu.store';
import { useCanvasClipboardStore } from '../../stores/canvasClipboard.store';
import { useTableStore } from '@/features/table/stores/table.store';
import { RenameDialog } from '@/shared/components/RenameDialog';
import { ColorPicker } from '@/shared/components/ColorPicker';
import { TABLE_COLORS } from '../../constants/canvas.constants';
import type { RelationshipType } from '../../types/Canvas';
import { Z_INDEX } from '@/shared/constants';

interface MenuItemProps {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

function MenuItem({ label, onClick, danger = false, disabled = false }: MenuItemProps): ReactNode {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors ${
        disabled
          ? 'text-muted-foreground cursor-not-allowed'
          : danger
            ? 'text-danger hover:bg-danger/10'
            : 'text-foreground hover:bg-surface-hover'
      }`}
    >
      {label}
    </button>
  );
}

function Separator(): ReactNode {
  return <div className="my-1 h-px bg-border" />;
}

export interface CanvasContextMenuProps {
  onAddTable: () => void;
  onAddNote: () => void;
  onDeleteTarget: (id: string) => void;
  onSelectAll: () => void;
  onFitView: () => void;
  onRenameTable: (tableId: string, newName: string) => void;
  onChangeTableColor: (tableId: string, color: string) => void;
  onChangeRelationshipType: (relId: string, type: RelationshipType) => void;
}

export function CanvasContextMenu({
  onAddTable,
  onAddNote,
  onDeleteTarget,
  onSelectAll,
  onFitView,
  onRenameTable,
  onChangeTableColor,
  onChangeRelationshipType,
}: CanvasContextMenuProps): ReactNode {
  const { open, x, y, targetType, targetId, closeMenu } = useCanvasContextMenuStore();
  const hasClipboardItem = useCanvasClipboardStore((s) => s.hasItem());
  const ref = useRef<HTMLDivElement>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  useClickOutside(ref, () => {
    if (open && !renameOpen) closeMenu();
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closeMenu]);

  const handleRenameConfirm = useCallback(
    (newName: string) => {
      if (targetId) onRenameTable(targetId, newName);
      setRenameOpen(false);
      closeMenu();
    },
    [targetId, onRenameTable, closeMenu],
  );

  const handleColorChange = useCallback(
    (color: string) => {
      if (targetId) onChangeTableColor(targetId, color);
      setColorPickerOpen(false);
      closeMenu();
    },
    [targetId, onChangeTableColor, closeMenu],
  );

  const handleChangeRelType = useCallback(
    (type: RelationshipType) => {
      if (targetId) onChangeRelationshipType(targetId, type);
      closeMenu();
    },
    [targetId, onChangeRelationshipType, closeMenu],
  );

  const currentTableName =
    targetType === 'table' && targetId
      ? (useTableStore.getState().tables[targetId]?.name ?? '')
      : '';

  const currentTableColor =
    targetType === 'table' && targetId
      ? (useTableStore.getState().tables[targetId]?.color ?? TABLE_COLORS[0])
      : TABLE_COLORS[0];

  if (!open) return null;

  return (
    <>
      <div
        ref={ref}
        className="fixed bg-card border border-border rounded-lg shadow-xl py-1 min-w-44"
        style={{ left: x, top: y, zIndex: Z_INDEX.CONTEXT_MENU }}
      >
        {targetType === 'canvas' && (
          <>
            <MenuItem label="Add Table" onClick={() => { onAddTable(); closeMenu(); }} />
            <MenuItem label="Add Note" onClick={() => { onAddNote(); closeMenu(); }} />
            {hasClipboardItem && (
              <MenuItem label="Paste" onClick={closeMenu} />
            )}
            <Separator />
            <MenuItem label="Select All" onClick={() => { onSelectAll(); closeMenu(); }} />
            <MenuItem label="Fit View" onClick={() => { onFitView(); closeMenu(); }} />
          </>
        )}

        {targetType === 'table' && targetId && (
          <>
            <MenuItem label="Rename Table" onClick={() => setRenameOpen(true)} />
            <MenuItem label="Change Color" onClick={() => setColorPickerOpen((v) => !v)} />
            {colorPickerOpen && (
              <div className="px-3 py-2">
                <ColorPicker
                  value={currentTableColor}
                  options={TABLE_COLORS}
                  onChange={handleColorChange}
                />
              </div>
            )}
            <MenuItem label="Duplicate Table" onClick={closeMenu} disabled />
            <Separator />
            <MenuItem
              label="Delete Table"
              danger
              onClick={() => { onDeleteTarget(targetId); closeMenu(); }}
            />
          </>
        )}

        {targetType === 'relationship' && targetId && (
          <>
            <MenuItem label="One to One" onClick={() => handleChangeRelType('ONE_TO_ONE')} />
            <MenuItem label="One to Many" onClick={() => handleChangeRelType('ONE_TO_MANY')} />
            <MenuItem label="Many to One" onClick={() => handleChangeRelType('MANY_TO_ONE')} />
            <Separator />
            <MenuItem
              label="Delete Relationship"
              danger
              onClick={() => { onDeleteTarget(targetId); closeMenu(); }}
            />
          </>
        )}

        {targetType === 'note' && targetId && (
          <>
            <MenuItem label="Edit Note" onClick={closeMenu} />
            <Separator />
            <MenuItem
              label="Delete Note"
              danger
              onClick={() => { onDeleteTarget(targetId); closeMenu(); }}
            />
          </>
        )}
      </div>

      {renameOpen && targetId && (
        <RenameDialog
          open={renameOpen}
          title="Rename Table"
          initialValue={currentTableName}
          onConfirm={handleRenameConfirm}
          onCancel={() => { setRenameOpen(false); closeMenu(); }}
        />
      )}
    </>
  );
}
