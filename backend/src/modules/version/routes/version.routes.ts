import { FastifyPluginAsync } from 'fastify';
import { VersionController } from '../controller/version.controller';
import { VersionService } from '../service/version.service';
import { DraftService } from '../service/draft.service';
import { PublishService } from '../service/publish.service';
import { VersionRepository } from '../repository/version.repository';
import { prisma } from '../../../infrastructure/db';
import { authMiddleware } from '../../auth/middleware/auth.middleware';

export const versionRoutes: FastifyPluginAsync = async (app) => {
  const versionRepository = new VersionRepository(prisma);
  const draftService = new DraftService(prisma, versionRepository);
  const publishService = new PublishService(prisma, versionRepository);
  const versionService = new VersionService(prisma, versionRepository, draftService, publishService);
  const controller = new VersionController(versionService);

  app.addHook('preHandler', authMiddleware);

  app.get('/diagrams/:id/versions', controller.getVersionHistory);
  app.post('/diagrams/:id/draft', controller.createDraft);
  app.delete('/diagrams/:id/draft', controller.discardDraft);
  
  app.get('/versions/:id/review', controller.getReviewSummary);
  app.post('/versions/:id/publish', controller.publishDraft);
};
