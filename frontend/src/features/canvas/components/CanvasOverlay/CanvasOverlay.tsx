import { type ReactNode } from 'react';
import { useCanvasInteractionStore } from '../../stores/canvasInteraction.store';
import { useCanvasGuideStore } from '../../stores/canvasGuide.store';
import { CANVAS } from '../../constants/canvas.constants';
import { InteractionMode } from '../../types/InteractionMode';

function SelectionBox(): ReactNode {
  const mode = useCanvasInteractionStore((s) => s.mode);

  if (mode !== InteractionMode.Selecting) return null;

  return (
    <div
      className="absolute pointer-events-none border-2 border-primary bg-primary/10"
      style={{ zIndex: 5 }}
    />
  );
}

function SnapGuides(): ReactNode {
  const snapLines = useCanvasGuideStore((s) => s.snapLines);

  if (snapLines.length === 0) return null;

  return (
    <>
      {snapLines.map((line, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            zIndex: 6,
            backgroundColor: CANVAS.SELECTION_COLOR,
            ...(line.axis === 'x'
              ? { left: line.position, top: 0, width: 1, height: '100%' }
              : { left: 0, top: line.position, width: '100%', height: 1 }),
          }}
        />
      ))}
    </>
  );
}

export function CanvasOverlay(): ReactNode {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
      <SelectionBox />
      <SnapGuides />
    </div>
  );
}
