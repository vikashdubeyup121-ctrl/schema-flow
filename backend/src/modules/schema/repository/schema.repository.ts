import { PrismaClient, SchemaTable, SchemaColumn, SchemaRelationship, SchemaNote, DiagramVersion } from '@prisma/client';

export interface SchemaData {
  tables: (SchemaTable & { columns: SchemaColumn[] })[];
  relationships: SchemaRelationship[];
  notes: SchemaNote[];
  metadata: {
    versionId: string;
    review: boolean;
  };
}

export class SchemaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getVersion(versionId: string): Promise<DiagramVersion | null> {
    return this.prisma.diagramVersion.findUnique({
      where: { id: versionId },
    });
  }

  async loadSchema(versionId: string): Promise<SchemaData> {
    const version = await this.getVersion(versionId);
    if (!version) {
      throw new Error('VERSION_NOT_FOUND');
    }

    const tables = await this.prisma.schemaTable.findMany({
      where: { versionId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
        },
      },
    });

    const relationships = await this.prisma.schemaRelationship.findMany({
      where: { versionId },
    });

    const notes = await this.prisma.schemaNote.findMany({
      where: { versionId },
    });

    return {
      tables,
      relationships,
      notes,
      metadata: {
        versionId,
        review: version.status === 'DRAFT',
      },
    };
  }
}
