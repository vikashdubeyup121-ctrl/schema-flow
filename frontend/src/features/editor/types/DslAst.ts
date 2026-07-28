export type RefType = '>' | '<' | '-';

export interface DslColumn {
  name: string;
  dataType: string;
  primaryKey: boolean;
  notNull: boolean;
  unique: boolean;
  defaultValue: string | null;
  refTarget: string | null;
  refType: RefType | null;
  inlineFullRef?: DslRef | null;
  note?: string | null;
}

export interface DslTable {
  name: string;
  columns: DslColumn[];
  color?: string;
}

export interface DslRef {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: RefType;
}

export interface DslAst {
  tables: DslTable[];
  refs: DslRef[];
}
