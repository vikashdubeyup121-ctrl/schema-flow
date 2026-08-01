import type { DslAst, DslTable, DslColumn, DslRef, RefType, DslNote } from '../types/DslAst';

// ─── Regex patterns ────────────────────────────────────────────────────────────

const TABLE_OPEN_RE = /^\s*[Tt]able\s+(\w+)\s*\{/;
const TABLE_CLOSE_RE = /^\s*\}/;
const REF_STATEMENT_RE = /^\s*[Rr]ef(?:\s+\w+)?\s*:\s*(\w+)\.(\w+)\s*([><-])\s*(\w+)\.(\w+)/;
const COMMENT_RE = /^\s*\/\//;

// ─── Column constraint parser ──────────────────────────────────────────────────

function parseConstraintBlock(raw: string): Partial<DslColumn> {
  const result: Partial<DslColumn> = {};
  
  let constraintStr = raw;
  const noteMatch = /note:\s*(?:"([^"]+)"|'([^']+)')/i.exec(constraintStr);
  if (noteMatch) {
    result.note = noteMatch[1] || noteMatch[2] || null;
    constraintStr = constraintStr.replace(noteMatch[0], '');
  }

  const parts = constraintStr.split(',').map((p) => p.trim());

  for (const part of parts) {
    if (!part) continue;
    const lowerPart = part.toLowerCase();
    
    if (lowerPart === 'pk' || lowerPart === 'primary key') {
      result.primaryKey = true;
      result.notNull = true;
    } else if (lowerPart === 'not null') {
      result.notNull = true;
    } else if (lowerPart === 'unique') {
      result.unique = true;
    } else if (lowerPart.startsWith('default:')) {
      result.defaultValue = part.substring(8).trim().replace(/^`|`$/g, '');
    } else if (lowerPart.startsWith('ref:')) {
      const refPart = part.substring(4).trim();
      
      const shortMatch = /^([><-])\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/.exec(refPart);
      if (shortMatch) {
        result.refType = shortMatch[1] as RefType;
        result.refTarget = `${shortMatch[2]}.${shortMatch[3]}`;
        continue;
      }

      const fullMatch = /^\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*([><-])\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/.exec(refPart);
      if (fullMatch) {
        result.inlineFullRef = {
          fromTable: fullMatch[1] ?? '',
          fromColumn: fullMatch[2] ?? '',
          type: (fullMatch[3] ?? '-') as RefType,
          toTable: fullMatch[4] ?? '',
          toColumn: fullMatch[5] ?? '',
        };
      }
    }
  }

  return result;
}

// ─── Column line parser ────────────────────────────────────────────────────────

function parseColumnLine(line: string): DslColumn | null {
  const trimmed = line.trim();
  if (!trimmed || COMMENT_RE.test(trimmed)) return null;

  // Match: name type [constraints]
  const match = /^(\w+)\s+(\w+)(?:\s*\[([^\]]*)\])?/.exec(trimmed);
  if (!match) return null;

  const name = match[1] ?? '';
  const dataType = (match[2] ?? '').toUpperCase();
  const constraintRaw = match[3] ?? '';

  const constraints = constraintRaw ? parseConstraintBlock(constraintRaw) : {};

  return {
    name,
    dataType,
    primaryKey: constraints.primaryKey ?? false,
    notNull: constraints.notNull ?? false,
    unique: constraints.unique ?? false,
    defaultValue: constraints.defaultValue ?? null,
    refTarget: constraints.refTarget ?? null,
    refType: constraints.refType ?? null,
    inlineFullRef: constraints.inlineFullRef ?? null,
    note: constraints.note ?? null,
  };
}

// ─── Ref statement parser ──────────────────────────────────────────────────────

function parseRefStatement(line: string): DslRef | null {
  const match = REF_STATEMENT_RE.exec(line);
  if (!match) return null;

  const [, fromTable, fromColumn, refType, toTable, toColumn] = match;
  if (!fromTable || !fromColumn || !refType || !toTable || !toColumn) return null;

  return {
    fromTable,
    fromColumn,
    toTable,
    toColumn,
    type: refType as RefType,
  };
}

// ─── Main parser ───────────────────────────────────────────────────────────────

export function parseDsl(dsl: string): DslAst {
  const tables: DslTable[] = [];
  const refs: DslRef[] = [];
  const notes: DslNote[] = [];

  // Extract Notes first to avoid issues with '}' inside multi-line strings
  const noteRegex = /^\s*[Nn]ote\s+(?:"([^"]+)"|'([^']+)'|(\w+))\s*\{([\s\S]*?)\n\s*\}/gm;
  let match;
  while ((match = noteRegex.exec(dsl)) !== null) {
    const title = match[1] || match[2] || match[3] || 'Note';
    let rawContent = (match[4] || '').trim();
    let color: string | undefined;

    const colorMatch = /\/\/\s*@color:\s*(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/.exec(rawContent);
    if (colorMatch) {
      color = colorMatch[1];
      rawContent = rawContent.replace(colorMatch[0], '').trim();
    }

    let finalContent = rawContent;
    const contentMatch = /(?:text\s*)?(?:"([^"]*)"|'([^']*)')/.exec(rawContent);
    if (contentMatch) {
      finalContent = contentMatch[1] ?? contentMatch[2] ?? rawContent;
    } else {
      if ((rawContent.startsWith("'") && rawContent.endsWith("'")) || 
          (rawContent.startsWith('"') && rawContent.endsWith('"'))) {
        finalContent = rawContent.slice(1, -1);
      }
    }
    const noteNode: any = { title, content: finalContent };
    if (color) {
      noteNode.color = color;
    }
    notes.push(noteNode);
  }

  // Remove notes from DSL so they don't interfere with line parsing
  const dslWithoutNotes = dsl.replace(noteRegex, '');
  const remainingLines = dslWithoutNotes.split('\n');

  let currentTable: DslTable | null = null;

  for (const line of remainingLines) {
    if (COMMENT_RE.test(line)) {
      if (currentTable) {
        const colorMatch = /@color:\s*(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/.exec(line);
        if (colorMatch && colorMatch[1]) {
          currentTable.color = colorMatch[1];
        }
      }
      continue;
    }

    if (TABLE_OPEN_RE.test(line)) {
      const match = TABLE_OPEN_RE.exec(line);
      const name = match?.[1];
      if (name) {
        currentTable = { name, columns: [] };
      }
      continue;
    }

    if (TABLE_CLOSE_RE.test(line)) {
      if (currentTable) {
        tables.push(currentTable);
        currentTable = null;
      }
      continue;
    }

    if (REF_STATEMENT_RE.test(line)) {
      const ref = parseRefStatement(line);
      if (ref) refs.push(ref);
      continue;
    }

    if (currentTable) {
      const column = parseColumnLine(line);
      if (column) currentTable.columns.push(column);
    }
  }

  // Push unclosed table (fault-tolerant)
  if (currentTable) tables.push(currentTable);

  // Extract inline refs from columns
  for (const table of tables) {
    for (const col of table.columns) {
      if (col.refTarget && col.refType) {
        const [toTable, toColumn] = col.refTarget.split('.');
        if (toTable && toColumn) {
          const alreadyExists = refs.some(
            (r) =>
              r.fromTable === table.name &&
              r.fromColumn === col.name &&
              r.toTable === toTable &&
              r.toColumn === toColumn,
          );
          if (!alreadyExists) {
            refs.push({
              fromTable: table.name,
              fromColumn: col.name,
              toTable,
              toColumn,
              type: col.refType,
            });
          }
        }
      }
      if (col.inlineFullRef) {
        const r = col.inlineFullRef;
        const alreadyExists = refs.some(
          (ex) =>
            ex.fromTable === r.fromTable &&
            ex.fromColumn === r.fromColumn &&
            ex.toTable === r.toTable &&
            ex.toColumn === r.toColumn
        );
        if (!alreadyExists) {
          refs.push(r);
        }
      }
    }
  }

  return { tables, refs, notes };
}
