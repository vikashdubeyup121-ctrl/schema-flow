import { Serializer, SchemaDocument } from '../parser/ast';

export class JsonSerializer implements Serializer {
  serialize(schema: SchemaDocument): string {
    return JSON.stringify(schema, null, 2);
  }
}
