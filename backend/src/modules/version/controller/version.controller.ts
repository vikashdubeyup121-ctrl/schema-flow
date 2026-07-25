import { FastifyRequest, FastifyReply } from 'fastify';
import { VersionService } from '../service/version.service';

export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  getVersionHistory = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      const history = await this.versionService.getVersionHistory(user.userId, req.params.id);
      reply.send({ success: true, data: history });
    } catch (err: any) {
      const status = err.message === 'DIAGRAM_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  createDraft = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      const draft = await this.versionService.createDraft(user.userId, req.params.id);
      reply.status(201).send({ success: true, data: draft });
    } catch (err: any) {
      const status = err.message === 'DRAFT_ALREADY_EXISTS' ? 409 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  discardDraft = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      await this.versionService.discardDraft(user.userId, req.params.id);
      reply.send({ success: true, data: {} });
    } catch (err: any) {
      reply.status(500).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  publishDraft = async (req: FastifyRequest<{ Params: { id: string }, Body: { revisionNumber: number } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      const published = await this.versionService.publishDraft(user.userId, req.params.id, req.body.revisionNumber);
      reply.send({ success: true, data: published });
    } catch (err: any) {
      const status = err.message === 'OPTIMISTIC_CONCURRENCY_CONFLICT' ? 409 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  getReviewSummary = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      const summary = await this.versionService.getReviewSummary(user.userId, req.params.id);
      reply.send({ success: true, data: summary });
    } catch (err: any) {
      reply.status(500).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };
}
