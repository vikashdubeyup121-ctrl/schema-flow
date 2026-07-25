import { PrismaClient } from '@prisma/client';
import { DraftService } from './draft.service';
import { PublishService } from './publish.service';
import { VersionRepository } from '../repository/version.repository';

export class VersionService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly versionRepository: VersionRepository,
    private readonly draftService: DraftService,
    private readonly publishService: PublishService
  ) {}

  private async authorize(userId: string, diagramId: string) {
    const diagram = await this.prisma.diagram.findUnique({
      where: { id: diagramId },
      include: { project: true },
    });
    if (!diagram) throw new Error('DIAGRAM_NOT_FOUND');
    if (diagram.project.ownerId !== userId) throw new Error('FORBIDDEN');
    return diagram;
  }

  async getVersionHistory(userId: string, diagramId: string) {
    await this.authorize(userId, diagramId);
    return this.versionRepository.getVersionHistory(diagramId);
  }

  async createDraft(userId: string, diagramId: string) {
    await this.authorize(userId, diagramId);
    return this.draftService.createDraft(diagramId, userId);
  }

  async discardDraft(userId: string, diagramId: string) {
    await this.authorize(userId, diagramId);
    await this.draftService.discardDraft(diagramId);
  }

  async publishDraft(userId: string, diagramId: string, revisionNumber: number) {
    await this.authorize(userId, diagramId);
    return this.publishService.publishDraft(diagramId, userId, revisionNumber);
  }

  async getReviewSummary(userId: string, versionId: string) {
    const version = await this.prisma.diagramVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new Error('VERSION_NOT_FOUND');
    await this.authorize(userId, version.diagramId);

    // Naive summary logic based on reviewState counts
    const [tablesCreated, tablesModified, tablesDeleted] = await Promise.all([
      this.prisma.schemaTable.count({ where: { versionId, reviewState: 'CREATED' } }),
      this.prisma.schemaTable.count({ where: { versionId, reviewState: 'MODIFIED' } }),
      this.prisma.schemaTable.count({ where: { versionId, reviewState: 'DELETED' } }),
    ]);

    const columnsCreated = await this.prisma.schemaColumn.count({
      where: {
        table: { versionId },
        reviewState: 'CREATED',
      },
    });

    return {
      summary: {
        tablesCreated,
        tablesModified,
        tablesDeleted,
        columnsCreated,
      }
    };
  }
}
