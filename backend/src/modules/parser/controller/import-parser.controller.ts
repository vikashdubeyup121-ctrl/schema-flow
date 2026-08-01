import { FastifyRequest, FastifyReply } from 'fastify';
import { ImportParserService } from '../service/import-parser.service';

export class ImportParserController {
  private importParserService = new ImportParserService();

  getPlugins = async (req: FastifyRequest, reply: FastifyReply) => {
    const plugins = this.importParserService.getPlugins();
    return reply.send({ success: true, data: plugins });
  };

  importSchema = async (
    req: FastifyRequest<{
      Params: { diagramId: string };
      Body: { pluginId: string; content: string; action: 'append' | 'replace' };
    }>,
    reply: FastifyReply
  ) => {
    const { diagramId } = req.params;
    const { pluginId, content, action } = req.body;

    if (!pluginId || !content || !action) {
      return reply.status(400).send({ success: false, error: 'Missing required fields: pluginId, content, action' });
    }

    try {
      const result = await this.importParserService.parseAndImport(diagramId, pluginId, content, action);

      return reply.send({ success: true, data: result });
    } catch (error: any) {
      return reply.status(400).send({ success: false, error: error.message });
    }
  };
}
