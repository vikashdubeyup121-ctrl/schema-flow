export type TargetLanguage = 'prisma' | 'postgres' | 'mongo';

// Maps our internal DSL data types to target-specific types
export class TypeMapper {
  static map(dataType: string, target: TargetLanguage): string {
    const normalized = dataType.toLowerCase();
    
    switch (target) {
      case 'prisma':
        return this.toPrismaType(normalized);
      case 'postgres':
        return this.toPostgresType(normalized);
      case 'mongo':
        return this.toMongoType(normalized);
      default:
        return dataType;
    }
  }

  private static toPrismaType(type: string): string {
    if (type.startsWith('varchar') || type.startsWith('char') || type === 'text') return 'String';
    if (type === 'int' || type === 'integer' || type === 'smallint') return 'Int';
    if (type === 'bigint') return 'BigInt';
    if (type === 'boolean' || type === 'bool') return 'Boolean';
    if (type === 'float' || type === 'real' || type === 'double') return 'Float';
    if (type === 'decimal' || type === 'numeric') return 'Decimal';
    if (type === 'date' || type === 'datetime' || type === 'timestamp') return 'DateTime';
    if (type === 'json' || type === 'jsonb') return 'Json';
    if (type === 'uuid') return 'String';
    // If it's an enum or custom type, capitalize it
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  private static toPostgresType(type: string): string {
    if (type === 'string') return 'VARCHAR(255)';
    if (type === 'int') return 'INTEGER';
    if (type === 'datetime') return 'TIMESTAMP';
    if (type === 'bool') return 'BOOLEAN';
    // Preserve existing Postgres types like varchar(50)
    return type.toUpperCase();
  }

  private static toMongoType(type: string): string {
    if (type.startsWith('varchar') || type.startsWith('char') || type === 'text' || type === 'uuid' || type === 'string') return 'String';
    if (type === 'int' || type === 'integer' || type === 'bigint' || type === 'float' || type === 'decimal') return 'Number';
    if (type === 'boolean' || type === 'bool') return 'Boolean';
    if (type === 'date' || type === 'datetime' || type === 'timestamp') return 'Date';
    if (type === 'json' || type === 'jsonb') return 'Object';
    // ObjectId references will be handled by the generator logic itself, not here
    return 'String';
  }
}
