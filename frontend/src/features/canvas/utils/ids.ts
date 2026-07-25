export function generateTableId(): string {
  return `table_${crypto.randomUUID()}`;
}

export function generateColumnId(): string {
  return `col_${crypto.randomUUID()}`;
}

export function generateRelationshipId(): string {
  return `rel_${crypto.randomUUID()}`;
}

export function generateNoteId(): string {
  return `note_${crypto.randomUUID()}`;
}

export function generateEventId(): string {
  return `evt_${crypto.randomUUID()}`;
}

export function makeColumnSourceHandle(columnId: string): string {
  return `col-${columnId}-source`;
}

export function makeColumnTargetHandle(columnId: string): string {
  return `col-${columnId}-target`;
}
