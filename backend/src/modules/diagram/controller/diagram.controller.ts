import { FastifyRequest, FastifyReply } from 'fastify';
import { DiagramService } from '../service/diagram.service';
import { CreateDiagramSchema, UpdateDiagramSchema, ViewportSchema } from '../dto/diagram.dto';
import { DiagramMapper } from '../mapper/diagram.mapper';

export class DiagramController {
  constructor(private readonly diagramService: DiagramService) {}

  create = async (req: FastifyRequest<{ Params: { projectId: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    const result = CreateDiagramSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message } });
    }

    try {
      const diagram = await this.projectToDiagram(user.userId, req.params.projectId, result.data);
      reply.status(201).send({ success: true, data: DiagramMapper.toResponse(diagram) });
    } catch (err: any) {
      const status = err.message === 'PROJECT_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  private projectToDiagram = async (userId: string, projectId: string, data: any) => {
    return this.diagramService.create(userId, projectId, data);
  }

  list = async (req: FastifyRequest<{ Params: { projectId: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      const diagrams = await this.diagramService.list(user.userId, req.params.projectId);
      reply.send({ success: true, data: diagrams.map(DiagramMapper.toResponse) });
    } catch (err: any) {
      console.error(err);
      const status = err.message === 'PROJECT_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  get = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      const diagram = await this.diagramService.get(user.userId, req.params.id);
      reply.send({ success: true, data: DiagramMapper.toResponse(diagram) });
    } catch (err: any) {
      const status = err.message === 'DIAGRAM_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  update = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    const result = UpdateDiagramSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message } });
    }

    try {
      const diagram = await this.diagramService.update(user.userId, req.params.id, result.data);
      reply.send({ success: true, data: DiagramMapper.toResponse(diagram) });
    } catch (err: any) {
      const status = err.message === 'DIAGRAM_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  delete = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      await this.diagramService.delete(user.userId, req.params.id);
      reply.send({ success: true, data: {} });
    } catch (err: any) {
      const status = err.message === 'DIAGRAM_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  saveViewport = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    const result = ViewportSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message } });
    }

    try {
      const diagram = await this.diagramService.saveViewport(user.userId, req.params.id, result.data);
      reply.send({ success: true, data: DiagramMapper.toResponse(diagram) });
    } catch (err: any) {
      const status = err.message === 'DIAGRAM_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  publish = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      const diagram = await this.diagramService.publish(user.userId, req.params.id);
      reply.send({ success: true, data: DiagramMapper.toResponse(diagram) });
    } catch (err: any) {
      const status = err.message === 'DIAGRAM_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };
}
