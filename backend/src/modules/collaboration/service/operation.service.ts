import { SchemaService } from '../../schema/service/schema.service';
import { CollaborationOperation } from '../types';
import { PrismaClient } from '@prisma/client';

export class OperationService {
  // A simplistic queue mapping diagramId -> Promise chain to ensure operations are processed sequentially
  private roomQueues: Map<string, Promise<any>> = new Map();

  constructor(
    private readonly schemaService: SchemaService,
    private readonly prisma: PrismaClient
  ) {}

  async processOperation(diagramId: string, operation: CollaborationOperation): Promise<any> {
    const queue = this.roomQueues.get(diagramId) || Promise.resolve();
    
    const task = queue.then(async () => {
      // 1. Revision Check (Optimistic Concurrency)
      const draft = await this.prisma.diagramVersion.findFirst({
        where: { diagramId, status: 'DRAFT' }
      });
      
      if (!draft) throw new Error('DRAFT_NOT_FOUND');
      
      // Strict revision equality check for Phase 1
      if (draft.revisionNumber !== operation.revision) {
        throw new Error('REVISION_CONFLICT');
      }

      // 2. Persist using SchemaService (wrapping in Patch shape)
      await this.schemaService.applyPatch(operation.userId, draft.id, [{
        type: operation.type,
        payload: operation.payload,
      }]);

      // 3. Increment revision
      await this.prisma.diagramVersion.update({
        where: { id: draft.id },
        data: { revisionNumber: { increment: 1 } }
      });

      return {
        status: 'SUCCESS',
        operationId: operation.operationId,
        newRevision: draft.revisionNumber + 1
      };
    }).catch(err => {
      // Return failure ACK so gateway can broadcast it properly back to origin
      return {
        status: 'FAILED',
        operationId: operation.operationId,
        reason: err.message
      };
    });

    this.roomQueues.set(diagramId, task.catch(() => {})); // Prevent unhandled promise rejection cascading in the queue

    return task;
  }
}
