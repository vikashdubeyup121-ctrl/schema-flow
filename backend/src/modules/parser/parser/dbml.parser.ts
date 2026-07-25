import { Parser, ParseResult, SchemaDocument, Diagnostic } from '../parser/ast';

// MVP: Extremely naive DBML stub that just captures basic table structures.
// In a real implementation, this would use a robust Lexer/AST generator.
export class DbmlParser implements Parser {
  parse(input: string): ParseResult {
    const diagnostics: Diagnostic[] = [];
    const schema: SchemaDocument = { tables: [], relationships: [], notes: [] };
    
    // Very naive regex-based DBML parsing
    const tableRegex = /Table\s+([a-zA-Z0-9_]+)\s*{([^}]+)}/g;
    
    let match;
    while ((match = tableRegex.exec(input)) !== null) {
      const tableName = match[1];
      const body = match[2];
      
      const columns = body.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('//'))
        .map(line => {
          const parts = line.split(/\s+/);
          return {
            name: parts[0] || 'unknown',
            datatype: parts[1] || 'varchar',
            nullable: !line.includes('not null'),
            primaryKey: line.includes('[pk]') || line.includes('primary key'),
            uniqueKey: line.includes('[unique]'),
            defaultValue: null,
            note: null,
          };
        });

      schema.tables.push({
        name: tableName,
        description: null,
        columns,
      });
    }

    if (schema.tables.length === 0) {
      diagnostics.push({ severity: 'WARNING', message: 'No tables found in DBML', line: 1, column: 1 });
    }

    return { schema, diagnostics };
  }
}
