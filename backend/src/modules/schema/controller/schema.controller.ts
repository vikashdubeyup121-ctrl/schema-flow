import { FastifyRequest, FastifyReply } from 'fastify';
import { SchemaService } from '../service/schema.service';
import { PatchSchema } from '../dto/schema.dto';

export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  getSchema = async (req: FastifyRequest<{ Params: { versionId: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      const schema = await this.schemaService.getSchema(user.userId, req.params.versionId);
      reply.send({ success: true, data: schema });
    } catch (err: any) {
      const status = err.message === 'VERSION_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };

  applyPatch = async (req: FastifyRequest<{ Params: { versionId: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    const result = PatchSchema.safeParse(req.body);
    if (!result.success) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message } });
    }

    try {
      const schema = await this.schemaService.applyPatch(user.userId, req.params.versionId, result.data.operations);
      reply.send({ success: true, data: schema });
    } catch (err: any) {
      const status = err.message === 'VERSION_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : err.message === 'CANNOT_MUTATE_PUBLISHED_VERSION' ? 409 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };
}
