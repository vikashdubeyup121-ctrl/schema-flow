import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '@/shared/stores/toast.store';
import { Z_INDEX } from '@/shared/constants/ZIndex';
import { CloseIcon, SuccessIcon, ErrorIcon, WarningIcon, InfoIcon } from '@/shared/icons';

interface ToastProviderProps {
  children: ReactNode;
}

function ToastItem({
  id,
  message,
  variant,
  durationMs,
}: {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  durationMs: number;
}): ReactNode {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), durationMs);
    return () => clearTimeout(timer);
  }, [id, durationMs, dismiss]);

  const icons = {
    success: <SuccessIcon size={16} className="text-green-400 shrink-0" />,
    error: <ErrorIcon size={16} className="text-red-400 shrink-0" />,
    warning: <WarningIcon size={16} className="text-yellow-400 shrink-0" />,
    info: <InfoIcon size={16} className="text-blue-400 shrink-0" />,
  };

  const borderColors = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    warning: 'border-yellow-500/30',
    info: 'border-blue-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`flex items-start gap-3 rounded-lg border bg-surface px-4 py-3 shadow-lg min-w-72 max-w-sm ${borderColors[variant]}`}
    >
      {icons[variant]}
      <p className="flex-1 text-sm text-foreground">{message}</p>
      <button
        onClick={() => dismiss(id)}
        aria-label="Dismiss notification"
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <CloseIcon size={14} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: ToastProviderProps): ReactNode {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <>
      {children}
      <div
        style={{ zIndex: Z_INDEX.TOAST }}
        className="fixed top-4 right-4 flex flex-col gap-2 pointer-events-none"
      >
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem
                id={toast.id}
                message={toast.message}
                variant={toast.variant}
                durationMs={toast.durationMs}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
