export interface CanonicalColumn {
  name: string;
  datatype: string;
  nullable: boolean;
  primaryKey: boolean;
  uniqueKey: boolean;
  defaultValue: string | null;
  note: string | null;
}

export interface CanonicalTable {
  name: string;
  description: string | null;
  columns: CanonicalColumn[];
  x?: number;
  y?: number;
}

export interface CanonicalRelationship {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  relationshipType: string;
}

export interface CanonicalNote {
  title: string | null;
  markdown: string;
  x?: number;
  y?: number;
}

export interface SchemaDocument {
  tables: CanonicalTable[];
  relationships: CanonicalRelationship[];
  notes: CanonicalNote[];
}

export interface Diagnostic {
  severity: "ERROR" | "WARNING" | "INFO";
  message: string;
  line: number;
  column: number;
}

export interface ParseResult {
  schema: SchemaDocument;
  diagnostics: Diagnostic[];
}

export interface Parser {
  parse(input: string): ParseResult;
}

export interface Serializer {
  serialize(schema: SchemaDocument): string;
}
