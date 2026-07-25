import { Parser, Serializer, ParseResult, SchemaDocument } from '../parser/ast';
import { JsonParser } from '../parser/json.parser';
import { DbmlParser } from '../parser/dbml.parser';
import { JsonSerializer } from '../serializers/json.serializer';

export class ParserService {
  private parsers: Map<string, Parser> = new Map();
  private serializers: Map<string, Serializer> = new Map();

  constructor() {
    this.parsers.set('json', new JsonParser());
    this.parsers.set('dbml', new DbmlParser());

    this.serializers.set('json', new JsonSerializer());
  }

  detectFormat(input: string, filename?: string): string {
    if (filename && filename.endsWith('.json')) return 'json';
    if (filename && filename.endsWith('.dbml')) return 'dbml';
    
    const trimmed = input.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
    
    return 'dbml'; // default fallback
  }

  parse(input: string, format?: string): ParseResult {
    const detectedFormat = format || this.detectFormat(input);
    const parser = this.parsers.get(detectedFormat);
    
    if (!parser) {
      throw new Error(`Unsupported format: ${detectedFormat}`);
    }

    return parser.parse(input);
  }

  serialize(schema: SchemaDocument, format: string): string {
    const serializer = this.serializers.get(format);
    if (!serializer) {
      throw new Error(`Unsupported format: ${format}`);
    }

    return serializer.serialize(schema);
  }
}
