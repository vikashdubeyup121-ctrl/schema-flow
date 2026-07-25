import { SchemaRepository, SchemaData } from '../repository/schema.repository';
import { PrismaClient } from '@prisma/client';

import { randomUUID } from 'crypto';

export class SchemaService {
  constructor(
    private readonly schemaRepository: SchemaRepository,
    private readonly prisma: PrismaClient
  ) {}

  async getSchema(userId: string, versionId: string): Promise<SchemaData> {
    const version = await this.schemaRepository.getVersion(versionId);
    if (!version) {
      throw new Error('VERSION_NOT_FOUND');
    }

    // Ownership Validation: Diagram -> Project -> Owner
    const diagram = await this.prisma.diagram.findUnique({
      where: { id: version.diagramId },
      include: { project: true },
    });
    
    if (!diagram || diagram.project.ownerId !== userId) {
      throw new Error('FORBIDDEN');
    }

    return this.schemaRepository.loadSchema(versionId);
  }

  async applyPatch(userId: string, versionId: string, operations: any[]): Promise<SchemaData> {
    const version = await this.schemaRepository.getVersion(versionId);
    if (!version) throw new Error('VERSION_NOT_FOUND');
    
    if (version.status !== 'DRAFT') {
      throw new Error('CANNOT_MUTATE_PUBLISHED_VERSION');
    }

    const diagram = await this.prisma.diagram.findUnique({
      where: { id: version.diagramId },
      include: { project: true },
    });
    
    if (!diagram || diagram.project.ownerId !== userId) {
      throw new Error('FORBIDDEN');
    }

    // Transactional application of operations (stubbed for MVP implementation)
    await this.prisma.$transaction(async (tx) => {
      for (const op of operations) {
        if (op.type === 'CREATE_TABLE') {
          await tx.schemaTable.create({
            data: {
              versionId,
              lineageId: randomUUID(),
              name: op.payload.name,
              x: op.payload.x || 0,
              y: op.payload.y || 0,
              reviewState: 'CREATED',
            }
          });
        }
        // Basic MVP logic can be expanded by dedicated TableService, ColumnService, etc.
      }
    });

    return this.schemaRepository.loadSchema(versionId);
  }
}
