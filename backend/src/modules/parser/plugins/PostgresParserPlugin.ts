import { IParserPlugin } from './IParserPlugin';

export class PostgresParserPlugin implements IParserPlugin {
  id = 'postgres';
  name = 'PostgreSQL (Raw SQL)';

  getImportCommand(): string {
    return `Option 1: Extract from a local/remote Postgres host:
pg_dump -h <host> -p <port> -U <user> -d <dbname> --schema-only --no-owner --no-privileges > schema.sql

Option 2: Extract using a Connection String (e.g. Neon, Supabase, Render):
pg_dump "postgres://user:password@host:port/dbname" --schema-only --no-owner --no-privileges > schema.sql`;
  }

  getTroubleshootingGuide(): string {
    return 'Ensure you provided raw `CREATE TABLE` statements. We only parse standard PostgreSQL `CREATE TABLE` and `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY` syntax. Complex constraints or triggers will be ignored.';
  }

  async parse(content: string): Promise<string> {
    if (!content.trim()) {
      throw new Error('Schema content cannot be empty.');
    }

    // A very naive SQL parser for MVP
    // We look for CREATE TABLE statements
    const createTableRegex = /CREATE\s+TABLE\s+(?:public\.)?([A-Za-z0-9_]+)\s*\(([\s\S]*?)\);/gi;
    let match;
    const dslTables: string[] = [];
    let foundTables = false;

    while ((match = createTableRegex.exec(content)) !== null) {
      foundTables = true;
      const tableName = match[1];
      const body = match[2];

      let dslTable = `Table ${tableName} {\n`;

      const lines = body.split(',\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        if (line.toUpperCase().startsWith('CONSTRAINT') || line.toUpperCase().startsWith('PRIMARY KEY') || line.toUpperCase().startsWith('FOREIGN KEY')) {
          continue; // skip table-level constraints for now
        }

        const parts = line.split(/\s+/);
        if (parts.length < 2) continue;

        const fieldName = parts[0].replace(/"/g, '');
        let fieldType = parts[1].replace(/"/g, '').toUpperCase();
        
        let dslType = 'varchar';
        if (fieldType.includes('INT')) dslType = 'int';
        else if (fieldType.includes('NUMERIC') || fieldType.includes('DECIMAL') || fieldType.includes('REAL')) dslType = 'float';
        else if (fieldType.includes('TIME') || fieldType.includes('DATE')) dslType = 'timestamp';
        else if (fieldType.includes('BOOL')) dslType = 'boolean';
        else if (fieldType.includes('JSON')) dslType = 'json';
        else if (fieldType.includes('BYTEA')) dslType = 'bytea';
        else if (fieldType.includes('UUID')) dslType = 'uuid';

        const dslAttributes: string[] = [];
        if (line.toUpperCase().includes('PRIMARY KEY')) dslAttributes.push('pk');
        if (line.toUpperCase().includes('UNIQUE')) dslAttributes.push('unique');
        if (line.toUpperCase().includes('NOT NULL')) dslAttributes.push('not null');

        const attrString = dslAttributes.length > 0 ? ` [${dslAttributes.join(', ')}]` : '';
        dslTable += `  ${fieldName} ${dslType}${attrString}\n`;
      }

      dslTable += `}\n`;
      dslTables.push(dslTable);
    }

    if (!foundTables) {
      throw new Error('No `CREATE TABLE` statements found. Please ensure the SQL is valid.');
    }

    const dslRefs: string[] = [];
    const alterTableRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s+ADD\s+CONSTRAINT\s+[a-zA-Z0-9_]+\s+FOREIGN\s+KEY\s*\(([a-zA-Z0-9_]+)\)\s+REFERENCES\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s*\(([a-zA-Z0-9_]+)\)/gi;
    
    let refMatch;
    while ((refMatch = alterTableRegex.exec(content)) !== null) {
      const sourceTable = refMatch[1];
      const sourceColumn = refMatch[2];
      const targetTable = refMatch[3];
      const targetColumn = refMatch[4];
      
      dslRefs.push(`Ref: ${sourceTable}.${sourceColumn} > ${targetTable}.${targetColumn}`);
    }

    let finalDsl = dslTables.join('\n');
    if (dslRefs.length > 0) {
      finalDsl += '\n\n' + dslRefs.join('\n');
    }

    return finalDsl;
  }
}
