import { IParserPlugin } from '../plugins/IParserPlugin';
import { PrismaParserPlugin } from '../plugins/PrismaParserPlugin';
import { PostgresParserPlugin } from '../plugins/PostgresParserPlugin';
import { MongoDbParserPlugin } from '../plugins/MongoDbParserPlugin';
import { prisma } from '../../../infrastructure/db';
import { Prisma } from '@prisma/client';

export class ImportParserService {
  private plugins: Map<string, IParserPlugin>;

  constructor() {
    this.plugins = new Map<string, IParserPlugin>();
    this.registerPlugin(new PrismaParserPlugin());
    this.registerPlugin(new PostgresParserPlugin());
    this.registerPlugin(new MongoDbParserPlugin());
  }

  private registerPlugin(plugin: IParserPlugin) {
    this.plugins.set(plugin.id, plugin);
  }

  getPlugins() {
    return Array.from(this.plugins.values()).map(p => ({
      id: p.id,
      name: p.name,
      importCommand: p.getImportCommand(),
      troubleshootingGuide: p.getTroubleshootingGuide()
    }));
  }

  async parseAndImport(diagramId: string, pluginId: string, content: string, action: 'append' | 'replace'): Promise<{ dslText: string }> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Parser plugin '${pluginId}' not found.`);
    }

    // Check size limit (1MB roughly is 1000000 characters)
    if (content.length > 1000000) {
      throw new Error('Payload too large. Please import a schema smaller than 1MB.');
    }

    // Parse content
    const parsedDsl = await plugin.parse(content);

    // Get current diagram to resolve append/replace
    const diagram = await prisma.diagram.findUnique({
      where: { id: diagramId }
    });

    if (!diagram) {
      throw new Error('Diagram not found');
    }

    let finalDsl = parsedDsl;
    if (action === 'append' && diagram.dslText) {
      finalDsl = diagram.dslText + '\n\n// --- Imported Content ---\n\n' + parsedDsl;
    }

    // Save to database transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Save Import History
      await tx.importHistory.create({
        data: {
          diagramId,
          pluginId,
          rawContent: content
        }
      });

      // Update Diagram
      await tx.diagram.update({
        where: { id: diagramId },
        data: {
          dslText: finalDsl,
          version: { increment: 1 } // increment version for optimistic concurrency
        }
      });
    });

    return { dslText: finalDsl };
  }
}
