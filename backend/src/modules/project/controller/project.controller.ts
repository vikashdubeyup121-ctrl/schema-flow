import { FastifyRequest, FastifyReply } from 'fastify';
import { ProjectService } from '../service/project.service';
import { CreateProjectSchema, UpdateProjectSchema } from '../dto/project.dto';
import { ProjectMapper } from '../mapper/project.mapper';

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  create = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = (req as any).user;
    const result = CreateProjectSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message } });
    }

    try {
      const project = await this.projectService.create(user.userId, result.data);
      reply.status(201).send({ success: true, data: ProjectMapper.toResponse(project) });
    } catch (err: any) {
      const code = err.message === 'PROJECT_LIMIT_REACHED' ? 'LIMIT_REACHED' : 'INTERNAL_ERROR';
      reply.status(400).send({ success: false, error: { code, message: err.message } });
    }
  };

  list = async (req: FastifyRequest<{ Querystring: { page?: string; limit?: string; search?: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const search = req.query.search;

    try {
      const { projects, total } = await this.projectService.list(user.userId, page, limit, search);
      reply.send({ 
        success: true, 
        data: projects.map(ProjectMapper.toResponse),
        pagination: { page, limit, total }
      });
    } catch (err: any) {
      reply.status(500).send({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch projects' } });
    }
  };

  get = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      const project = await this.projectService.findById(user.userId, req.params.id);
      reply.send({ success: true, data: ProjectMapper.toResponse(project) });
    } catch (err: any) {
      const status = err.message === 'PROJECT_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  update = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    const result = UpdateProjectSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message } });
    }

    try {
      const project = await this.projectService.update(user.userId, req.params.id, result.data);
      reply.send({ success: true, data: ProjectMapper.toResponse(project) });
    } catch (err: any) {
      const status = err.message === 'PROJECT_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  delete = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      await this.projectService.delete(user.userId, req.params.id);
      reply.send({ success: true, data: {} });
    } catch (err: any) {
      const status = err.message === 'PROJECT_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  addMember = async (req: FastifyRequest<{ Params: { id: string }, Body: { email: string, role: 'EDITOR' | 'VIEWER' } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    const { email, role } = req.body;
    
    if (!email || !role || !['EDITOR', 'VIEWER'].includes(role)) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid email or role' } });
    }

    try {
      const member = await this.projectService.addMember(user.userId, req.params.id, email, role);
      reply.status(201).send({ success: true, data: member });
    } catch (err: any) {
      const status = err.message === 'USER_NOT_FOUND' ? 404 : (err.message === 'FORBIDDEN' ? 403 : 400);
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  getMembers = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      const members = await this.projectService.getMembers(user.userId, req.params.id);
      reply.send({ success: true, data: members });
    } catch (err: any) {
      const status = err.message === 'PROJECT_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  removeMember = async (req: FastifyRequest<{ Params: { id: string, userId: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      await this.projectService.removeMember(user.userId, req.params.id, req.params.userId);
      reply.send({ success: true, data: {} });
    } catch (err: any) {
      const status = err.message === 'PROJECT_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  updateMemberRole = async (req: FastifyRequest<{ Params: { id: string, userId: string }, Body: { role: 'EDITOR' | 'VIEWER' } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    const { role } = req.body;
    
    if (!role || !['EDITOR', 'VIEWER'].includes(role)) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid role' } });
    }

    try {
      const member = await this.projectService.updateMemberRole(user.userId, req.params.id, req.params.userId, role);
      reply.send({ success: true, data: member });
    } catch (err: any) {
      const status = err.message === 'PROJECT_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };
}
