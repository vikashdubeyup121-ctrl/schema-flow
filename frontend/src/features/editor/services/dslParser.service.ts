import type { DslAst, DslTable, DslColumn, DslRef, RefType } from '../types/DslAst';

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
    result.note = noteMatch[1] || noteMatch[2];
    constraintStr = constraintStr.replace(noteMatch[0], '');
  }

  const parts = constraintStr.split(',').map((p) => p.trim().toLowerCase());

  for (const part of parts) {
    if (!part) continue;
    if (part === 'pk' || part === 'primary key') {
      result.primaryKey = true;
      result.notNull = true;
    } else if (part === 'not null') {
      result.notNull = true;
    } else if (part === 'unique') {
      result.unique = true;
    } else if (part.startsWith('default:')) {
      result.defaultValue = part.replace('default:', '').trim().replace(/^`|`$/g, '');
    } else if (part.startsWith('ref:')) {
      const refPart = part.slice(4).trim();
      const refMatch = /^([><-])\s*(\w+)\.(\w+)/.exec(refPart);
      if (refMatch) {
        result.refType = refMatch[1] as RefType;
        result.refTarget = `${refMatch[2]}.${refMatch[3]}`;
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
  const lines = dsl.split('\n');
  const tables: DslTable[] = [];
  const refs: DslRef[] = [];

  let currentTable: DslTable | null = null;

  for (const line of lines) {
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
    }
  }

  return { tables, refs };
}
