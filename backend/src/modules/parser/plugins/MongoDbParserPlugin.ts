import { IParserPlugin } from './IParserPlugin';

export class MongoDbParserPlugin implements IParserPlugin {
  id = 'mongodb';
  name = 'MongoDB (Mongoose/NoSQL)';

  getImportCommand(): string {
    return `// Paste your Mongoose schemas or a JSON sample here.\n// E.g.\n// const userSchema = new mongoose.Schema({ name: String, posts: [{ type: ObjectId, ref: 'Post' }] });`;
  }

  getTroubleshootingGuide(): string {
    return 'For MVP, we support parsing Mongoose schema definitions. Ensure they follow the `new mongoose.Schema({ ... })` syntax. Nested arrays of ObjectIds will be mapped to foreign key Refs in our DSL.';
  }

  async parse(content: string): Promise<string> {
    if (!content.trim()) {
      throw new Error('Schema content cannot be empty.');
    }

    // A very naive Mongoose schema parser for MVP
    const schemaRegex = /(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*new\s+(?:mongoose\.)?Schema\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
    let match;
    const dslTables: string[] = [];
    const refs: string[] = [];
    let foundTables = false;

    while ((match = schemaRegex.exec(content)) !== null) {
      foundTables = true;
      let tableName = match[1].replace(/Schema$/i, ''); // e.g., userSchema -> user
      // Capitalize first letter
      tableName = tableName.charAt(0).toUpperCase() + tableName.slice(1);

      const body = match[2];
      let dslTable = `Table ${tableName} {\n  _id varchar [pk]\n`; // MongoDB always has _id

      // Split by comma for fields (very naive, assumes no nested braces with commas)
      const lines = body.split(',\n').map(l => l.trim()).filter(Boolean);
      
      for (const line of lines) {
        if (!line.includes(':')) continue;
        
        let [fieldName, fieldDef] = line.split(/:(.+)/);
        fieldName = fieldName.trim().replace(/['"]/g, '');
        fieldDef = fieldDef.trim();

        if (fieldName === '_id') continue;

        let dslType = 'varchar';
        if (fieldDef.includes('Number')) dslType = 'int';
        else if (fieldDef.includes('Boolean')) dslType = 'boolean';
        else if (fieldDef.includes('Date')) dslType = 'timestamp';
        else if (fieldDef.includes('ObjectId')) dslType = 'varchar'; // ObjectId maps to varchar in our relational view

        const dslAttributes: string[] = [];
        if (fieldDef.includes('required: true') || fieldDef.includes('required:true')) {
          dslAttributes.push('not null');
        }
        if (fieldDef.includes('unique: true') || fieldDef.includes('unique:true')) {
          dslAttributes.push('unique');
        }

        // Check for references
        const refMatch = fieldDef.match(/ref:\s*['"]([^'"]+)['"]/);
        if (refMatch) {
          const targetTable = refMatch[1];
          // Since it's MongoDB, if the field is an array [{ type: ObjectId, ref: 'Post' }], it's One-to-Many
          if (fieldDef.startsWith('[')) {
            refs.push(`Ref: ${tableName}._id < ${targetTable}.${fieldName}`);
          } else {
            refs.push(`Ref: ${targetTable}._id < ${tableName}.${fieldName}`);
          }
        }

        const attrString = dslAttributes.length > 0 ? ` [${dslAttributes.join(', ')}]` : '';
        dslTable += `  ${fieldName} ${dslType}${attrString}\n`;
      }

      dslTable += `}\n`;
      dslTables.push(dslTable);
    }

    if (!foundTables) {
      throw new Error('No Mongoose `new Schema(...)` definitions found.');
    }

    let finalDsl = dslTables.join('\n');
    if (refs.length > 0) {
      finalDsl += '\n' + refs.join('\n') + '\n';
    }

    return finalDsl;
  }
}
