import { FastifyPluginAsync } from 'fastify';
import { ProjectController } from '../controller/project.controller';
import { ProjectService } from '../service/project.service';
import { ProjectRepository } from '../repository/project.repository';
import { prisma } from '../../../infrastructure/db';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

export const projectRoutes: FastifyPluginAsync = async (app) => {
  const repository = new ProjectRepository(prisma);
  const service = new ProjectService(repository);
  const controller = new ProjectController(service);

  app.addHook('preHandler', authMiddleware);

  app.post('/', controller.create);
  app.get('/', controller.list);
  app.get('/:id', controller.get);
  app.patch('/:id', controller.update);
  app.delete('/:id', controller.delete);
};
