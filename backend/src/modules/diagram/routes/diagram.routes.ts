import { FastifyPluginAsync } from 'fastify';
import { DiagramController } from '../controller/diagram.controller';
import { DiagramService } from '../service/diagram.service';
import { DiagramRepository } from '../repository/diagram.repository';
import { ProjectRepository } from '../../project/repository/project.repository';
import { ProjectService } from '../../project/service/project.service';
import { prisma } from '../../../infrastructure/db';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

export const diagramRoutes: FastifyPluginAsync = async (app) => {
  const projectRepository = new ProjectRepository(prisma);
  const projectService = new ProjectService(projectRepository);
  const diagramRepository = new DiagramRepository(prisma);
  const diagramService = new DiagramService(diagramRepository, projectService);
  const controller = new DiagramController(diagramService);

  app.addHook('preHandler', authMiddleware);

  // Note: Fastify allows registering routes on different prefixes.
  // The spec requires: 
  // POST /projects/:projectId/diagrams
  // GET /projects/:projectId/diagrams
  // GET /diagrams/:diagramId
  // PATCH /diagrams/:diagramId
  // DELETE /diagrams/:diagramId
  // PATCH /diagrams/:diagramId/viewport

  app.post('/projects/:projectId/diagrams', controller.create);
  app.get('/projects/:projectId/diagrams', controller.list);
  
  app.get('/diagrams/:id', controller.get);
  app.get('/diagrams/:id/versions/:versionId', controller.getVersion);
  app.patch('/diagrams/:id', controller.update);
  app.delete('/diagrams/:id', controller.delete);
  app.patch('/diagrams/:id/viewport', controller.saveViewport);
  app.post('/diagrams/:id/publish', controller.publish);
};
