import { PrismaClient, DiagramVersion, Prisma } from '@prisma/client';

export class VersionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findDraftByDiagramId(diagramId: string): Promise<DiagramVersion | null> {
    return this.prisma.diagramVersion.findFirst({
      where: { diagramId, status: 'DRAFT' },
    });
  }

  async findPublishedByDiagramId(diagramId: string): Promise<DiagramVersion | null> {
    return this.prisma.diagramVersion.findFirst({
      where: { diagramId, status: 'PUBLISHED' },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async getVersionHistory(diagramId: string): Promise<DiagramVersion[]> {
    return this.prisma.diagramVersion.findMany({
      where: { diagramId, status: 'PUBLISHED' },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async createDraft(
    tx: Prisma.TransactionClient,
    diagramId: string,
    basedOnVersionId: string,
    userId: string,
    nextVersionNumber: number
  ): Promise<DiagramVersion> {
    return tx.diagramVersion.create({
      data: {
        diagramId,
        status: 'DRAFT',
        versionNumber: nextVersionNumber,
        basedOnVersionId,
        createdBy: userId,
      },
    });
  }

  async deleteDraft(diagramId: string): Promise<void> {
    await this.prisma.diagramVersion.deleteMany({
      where: { diagramId, status: 'DRAFT' },
    });
  }
}
