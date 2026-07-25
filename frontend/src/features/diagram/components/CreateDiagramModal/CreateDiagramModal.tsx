import { useState, useCallback, type ReactNode, type KeyboardEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';

interface CreateDiagramModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  isLoading: boolean;
}

export function CreateDiagramModal({
  open,
  onClose,
  onCreate,
  isLoading,
}: CreateDiagramModalProps): ReactNode {
  const [name, setName] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName('');
  }, [name, onCreate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit],
  );

  const handleClose = useCallback(() => {
    setName('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      open={open}
      title="New Diagram"
      onClose={handleClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!name.trim()}
          >
            Create
          </Button>
        </>
      }
    >
      <Input
        label="Diagram name"
        placeholder="e.g. Core Schema v1"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        disabled={isLoading}
      />
    </Modal>
  );
}
