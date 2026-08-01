import { parseDsl } from '@/features/editor/services/dslParser.service';
import { 
  PrismaGenerator, 
  PostgresGenerator, 
  MongoGenerator, 
  DslGenerator, 
  type TargetLanguage 
} from './generators';

export type ExportFormat = TargetLanguage | 'dsl';

export class ExportService {
  /**
   * Generates schema code from raw DSL text.
   */
  static generateExport(dslText: string, format: ExportFormat): string {
    const ast = parseDsl(dslText);
    
    switch (format) {
      case 'prisma':
        return new PrismaGenerator().generate(ast);
      case 'postgres':
        return new PostgresGenerator().generate(ast);
      case 'mongo':
        return new MongoGenerator().generate(ast);
      case 'dsl':
        return new DslGenerator(dslText).generate(ast);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Triggers a browser download for the generated string.
   */
  static downloadStringAsFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Gets the correct file extension for a format
   */
  static getFileExtension(format: ExportFormat): string {
    switch (format) {
      case 'prisma': return 'prisma';
      case 'postgres': return 'sql';
      case 'mongo': return 'js';
      case 'dsl': return 'dsl';
    }
  }
}
