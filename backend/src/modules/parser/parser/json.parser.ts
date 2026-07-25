import { Parser, ParseResult, SchemaDocument, Diagnostic } from '../parser/ast';

export class JsonParser implements Parser {
  parse(input: string): ParseResult {
    const diagnostics: Diagnostic[] = [];
    let schema: SchemaDocument = { tables: [], relationships: [], notes: [] };
    
    try {
      const parsed = JSON.parse(input);
      schema = {
        tables: Array.isArray(parsed.tables) ? parsed.tables : [],
        relationships: Array.isArray(parsed.relationships) ? parsed.relationships : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      };
    } catch (err: any) {
      diagnostics.push({
        severity: 'ERROR',
        message: 'Invalid JSON format: ' + err.message,
        line: 0,
        column: 0,
      });
    }

    return { schema, diagnostics };
  }
}
