import type { DslAst } from '@/features/editor/types/DslAst';
import type { SchemaGenerator } from './SchemaGenerator';

// A placeholder that just returns raw text (implemented separately since we already have the raw text in the editor)
export class DslGenerator implements SchemaGenerator {
  private rawDsl: string;
  
  constructor(rawDsl: string) {
    this.rawDsl = rawDsl;
  }
  
  generate(_ast: DslAst): string {
    return this.rawDsl;
  }
}
