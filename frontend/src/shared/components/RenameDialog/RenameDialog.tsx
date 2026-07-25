import { memo, useCallback, useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';

interface RenameDialogProps {
  open: boolean;
  title: string;
  initialValue: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export const RenameDialog = memo(function RenameDialog({
  open,
  title,
  initialValue,
  onConfirm,
  onCancel,
}: RenameDialogProps): ReactNode {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setTimeout(() => {
        inputRef.current?.select();
      }, 0);
    }
  }, [open, initialValue]);

  const handleConfirm = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed) {
      onConfirm(trimmed);
    }
  }, [value, onConfirm]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleConfirm();
      if (e.key === 'Escape') onCancel();
    },
    [handleConfirm, onCancel],
  );

  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!value.trim()}>
            Rename
          </Button>
        </>
      }
    >
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        label="Name"
        autoFocus
      />
    </Modal>
  );
});
