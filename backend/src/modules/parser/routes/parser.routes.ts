import { FastifyPluginAsync } from 'fastify';
import { ParserController } from '../controller/parser.controller';
import { ParserService } from '../service/parser.service';
import { SchemaService } from '../../schema/service/schema.service';
import { SchemaRepository } from '../../schema/repository/schema.repository';
import { prisma } from '../../../infrastructure/db';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

export const parserRoutes: FastifyPluginAsync = async (app) => {
  const parserService = new ParserService();
  const schemaRepo = new SchemaRepository(prisma);
  const schemaService = new SchemaService(schemaRepo, prisma);
  
  const controller = new ParserController(parserService, schemaService);

  app.addHook('preHandler', authMiddleware);

  app.post('/parser/preview', controller.previewImport);
  app.get('/versions/:versionId/export', controller.exportSchema);
};
