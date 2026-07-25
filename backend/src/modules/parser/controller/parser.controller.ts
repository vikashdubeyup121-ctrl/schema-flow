import { FastifyRequest, FastifyReply } from 'fastify';
import { ParserService } from '../service/parser.service';
import { SchemaService } from '../../schema/service/schema.service';

export class ParserController {
  constructor(
    private readonly parserService: ParserService,
    private readonly schemaService: SchemaService
  ) {}

  previewImport = async (req: FastifyRequest<{ Body: { content: string, format?: string } }>, reply: FastifyReply) => {
    try {
      const { content, format } = req.body;
      const result = this.parserService.parse(content, format);

      // Import Preview stats
      const preview = {
        tables: result.schema.tables.length,
        columns: result.schema.tables.reduce((acc, t) => acc + t.columns.length, 0),
        relationships: result.schema.relationships.length,
        warnings: result.diagnostics.filter(d => d.severity === 'WARNING'),
        errors: result.diagnostics.filter(d => d.severity === 'ERROR'),
      };

      reply.send({ success: true, data: preview });
    } catch (err: any) {
      reply.status(400).send({ success: false, error: { code: 'PARSE_FAILED', message: err.message } });
    }
  };

  exportSchema = async (req: FastifyRequest<{ Params: { versionId: string }, Querystring: { format: string } }>, reply: FastifyReply) => {
    const user = (req as any).user;
    try {
      // 1. Fetch from schema service
      const dbSchema = await this.schemaService.getSchema(user.userId, req.params.versionId);
      
      // 2. Convert to Canonical Model
      const canonicalSchema = {
        tables: dbSchema.tables.map(t => ({
          name: t.name,
          description: t.description,
          columns: t.columns.map(c => ({
            name: c.name,
            datatype: c.datatype,
            nullable: c.nullable,
            primaryKey: c.primaryKey,
            uniqueKey: c.uniqueKey,
            defaultValue: c.defaultValue,
            note: c.note,
          }))
        })),
        relationships: dbSchema.relationships.map(r => ({
          sourceTable: r.sourceTableId, // In reality, we'd lookup table name
          sourceColumn: r.sourceColumnId,
          targetTable: r.targetTableId,
          targetColumn: r.targetColumnId,
          relationshipType: r.relationshipType,
        })),
        notes: dbSchema.notes.map(n => ({
          title: n.title,
          markdown: n.markdown
        }))
      };

      // 3. Serialize
      const output = this.parserService.serialize(canonicalSchema, req.query.format || 'json');
      
      reply.send({ success: true, data: output });
    } catch (err: any) {
      const status = err.message === 'VERSION_NOT_FOUND' ? 404 : err.message === 'FORBIDDEN' ? 403 : 500;
      reply.status(status).send({ success: false, error: { code: err.message, message: err.message } });
    }
  };
}
