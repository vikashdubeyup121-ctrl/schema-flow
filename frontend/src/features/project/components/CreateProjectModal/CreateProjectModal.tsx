import { useState, useCallback, type ReactNode, type KeyboardEvent } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  isLoading: boolean;
}

export function CreateProjectModal({
  open,
  onClose,
  onCreate,
  isLoading,
}: CreateProjectModalProps): ReactNode {
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
      title="New Project"
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
        label="Project name"
        placeholder="e.g. E-commerce Platform"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        disabled={isLoading}
      />
    </Modal>
  );
}
