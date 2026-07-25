import { FastifyPluginAsync } from 'fastify';
import { SchemaController } from '../controller/schema.controller';
import { SchemaService } from '../service/schema.service';
import { SchemaRepository } from '../repository/schema.repository';
import { prisma } from '../../../infrastructure/db';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

export const schemaRoutes: FastifyPluginAsync = async (app) => {
  const repository = new SchemaRepository(prisma);
  const service = new SchemaService(repository, prisma);
  const controller = new SchemaController(service);

  app.addHook('preHandler', authMiddleware);

  app.get('/versions/:versionId/schema', controller.getSchema);
  app.post('/versions/:versionId/schema/patch', controller.applyPatch);
};
