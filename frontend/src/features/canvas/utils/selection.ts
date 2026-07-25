export function isMultiSelectKey(event: KeyboardEvent | MouseEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

export function isRangeSelectKey(event: KeyboardEvent | MouseEvent): boolean {
  return event.shiftKey;
}
