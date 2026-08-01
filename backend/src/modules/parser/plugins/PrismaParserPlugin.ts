import { IParserPlugin } from './IParserPlugin';

export class PrismaParserPlugin implements IParserPlugin {
  id = 'prisma';
  name = 'Prisma Schema';

  getImportCommand(): string {
    return `npx prisma db pull --url="postgresql://user:password@localhost:5432/mydb"\n# Then copy the contents of your generated prisma/schema.prisma file.`;
  }

  getTroubleshootingGuide(): string {
    return 'Ensure your Prisma schema is valid. We currently support `model` definitions and standard scalar types. Composite IDs (@@id) are partially supported. Make sure relationships use the @relation attribute with `fields` and `references` explicitly defined.';
  }

  async parse(content: string): Promise<string> {
    if (!content.trim()) {
      throw new Error('Schema content cannot be empty.');
    }

    // Basic cleaning: remove comments
    let cleaned = content.replace(/\/\/.*$/gm, '').trim();

    const modelRegex = /model\s+([A-Za-z0-9_]+)\s*\{([^}]*)\}/g;
    let match;
    const models: Record<string, { name: string; lines: string[] }> = {};
    const refs: string[] = [];
    const dslTables: string[] = [];

    while ((match = modelRegex.exec(cleaned)) !== null) {
      const modelName = match[1];
      const body = match[2];
      models[modelName] = { name: modelName, lines: body.split('\n').map(l => l.trim()).filter(Boolean) };
    }

    if (Object.keys(models).length === 0) {
      throw new Error('No `model` definitions found in the Prisma schema.');
    }

    for (const model of Object.values(models)) {
      let dslTable = `Table ${model.name} {\n`;

      for (const line of model.lines) {
        if (line.startsWith('@@')) continue; // skip block attributes for now

        // match field: name type attributes
        // Example: id Int @id @default(autoincrement())
        const parts = line.split(/\s+/);
        if (parts.length < 2) continue;

        const fieldName = parts[0];
        let fieldType = parts[1];
        const isOptional = fieldType.endsWith('?');
        const isArray = fieldType.endsWith('[]');
        if (isOptional || isArray) {
          fieldType = fieldType.replace('?', '').replace('[]', '');
        }

        const attributes = parts.slice(2).join(' ');

        // Check if fieldType is another model (relation)
        if (models[fieldType]) {
          // It's a relation field. Check for @relation(fields: [authorId], references: [id])
          const relMatch = attributes.match(/@relation\s*\(\s*fields:\s*\[([^\]]+)\],\s*references:\s*\[([^\]]+)\]/);
          if (relMatch) {
            const localField = relMatch[1].trim();
            const foreignField = relMatch[2].trim();
            // Prisma defines the relation on the "many" side (usually).
            // This is CurrentModel.localField -> TargetModel.foreignField
            refs.push(`Ref: ${fieldType}.${foreignField} < ${model.name}.${localField}`);
          }
          // We don't add relation fields to DSL directly, the DSL uses Ref.
          // The actual scalar field (e.g. authorId) will be added when its line is parsed.
          continue;
        }

        // Map Prisma type to DSL type
        let dslType = 'varchar';
        const typeUpper = fieldType.toUpperCase();
        if (['INT', 'BIGINT', 'SMALLINT'].includes(typeUpper)) dslType = 'int';
        else if (['FLOAT', 'DECIMAL', 'DOUBLE'].includes(typeUpper)) dslType = 'float';
        else if (['DATETIME'].includes(typeUpper)) dslType = 'timestamp';
        else if (['BOOLEAN'].includes(typeUpper)) dslType = 'boolean';
        else if (['JSON'].includes(typeUpper)) dslType = 'json';
        else if (['BYTES'].includes(typeUpper)) dslType = 'bytea';
        else dslType = 'varchar';

        const dslAttributes: string[] = [];
        if (attributes.includes('@id')) dslAttributes.push('pk');
        if (attributes.includes('@unique')) dslAttributes.push('unique');
        if (!isOptional) dslAttributes.push('not null');

        const attrString = dslAttributes.length > 0 ? ` [${dslAttributes.join(', ')}]` : '';
        dslTable += `  ${fieldName} ${dslType}${attrString}\n`;
      }

      dslTable += `}\n`;
      dslTables.push(dslTable);
    }

    let finalDsl = dslTables.join('\n');
    if (refs.length > 0) {
      finalDsl += '\n' + refs.join('\n') + '\n';
    }

    return finalDsl;
  }
}
