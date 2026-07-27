import { useState, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PopoverTooltipProps {
  children: ReactNode;
  content?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

export function PopoverTooltip({ children, content, className = "inline-flex", style }: PopoverTooltipProps): ReactNode {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!content) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    }
    setShow(true);
  };

  const handleMouseLeave = () => {
    setShow(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className}
        style={style}
      >
        {children}
      </div>
      {show && content &&
        createPortal(
          <div
            className="fixed z-[9999] px-3 py-2 text-xs text-zinc-100 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full max-w-[300px] whitespace-pre-wrap break-words"
            style={{ left: coords.x, top: coords.y }}
          >
            <div className="font-semibold text-zinc-300 mb-1 border-b border-zinc-700/50 pb-1">Column Note</div>
            {content}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-zinc-800 border-r border-b border-zinc-700 rotate-45" />
          </div>,
          document.body
        )}
    </>
  );
}
