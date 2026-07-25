export function isDeleteKey(event: KeyboardEvent): boolean {
  return event.key === 'Delete' || event.key === 'Backspace';
}

export function isEscapeKey(event: KeyboardEvent): boolean {
  return event.key === 'Escape';
}

export function isCopyKey(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.key === 'c';
}

export function isPasteKey(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.key === 'v';
}

export function isUndoKey(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'z';
}

export function isRedoKey(event: KeyboardEvent): boolean {
  return (
    ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') ||
    ((event.ctrlKey || event.metaKey) && event.key === 'y')
  );
}

export function isSelectAllKey(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.key === 'a';
}

export function isDuplicateKey(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.key === 'd';
}

export function isInTextInput(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );
}
