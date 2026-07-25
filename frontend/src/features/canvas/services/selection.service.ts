export interface SelectionResult {
  selectedIds: Set<string>;
}

export function computeSingleSelection(id: string): SelectionResult {
  return { selectedIds: new Set([id]) };
}

export function computeToggleSelection(
  currentSelection: Set<string>,
  id: string,
): SelectionResult {
  const next = new Set(currentSelection);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return { selectedIds: next };
}

export function computeAddToSelection(
  currentSelection: Set<string>,
  id: string,
): SelectionResult {
  const next = new Set(currentSelection);
  next.add(id);
  return { selectedIds: next };
}

export function computeAreaSelection(
  objects: Array<{ id: string; x: number; y: number; width: number; height: number }>,
  selectionRect: { x: number; y: number; width: number; height: number },
): SelectionResult {
  const selectedIds = new Set<string>();

  const selLeft = Math.min(selectionRect.x, selectionRect.x + selectionRect.width);
  const selRight = Math.max(selectionRect.x, selectionRect.x + selectionRect.width);
  const selTop = Math.min(selectionRect.y, selectionRect.y + selectionRect.height);
  const selBottom = Math.max(selectionRect.y, selectionRect.y + selectionRect.height);

  for (const obj of objects) {
    const objRight = obj.x + obj.width;
    const objBottom = obj.y + obj.height;

    const intersects =
      obj.x < selRight &&
      objRight > selLeft &&
      obj.y < selBottom &&
      objBottom > selTop;

    if (intersects) {
      selectedIds.add(obj.id);
    }
  }

  return { selectedIds };
}

export function computeInvertSelection(
  allIds: string[],
  currentSelection: Set<string>,
): SelectionResult {
  const selectedIds = new Set<string>();
  for (const id of allIds) {
    if (!currentSelection.has(id)) {
      selectedIds.add(id);
    }
  }
  return { selectedIds };
}
