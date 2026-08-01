import type { DslAst } from '@/features/editor/types/DslAst';

export interface SchemaGenerator {
  generate(ast: DslAst): string;
}
