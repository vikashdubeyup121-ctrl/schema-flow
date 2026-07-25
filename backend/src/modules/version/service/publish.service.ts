import { PrismaClient, DiagramVersion } from '@prisma/client';
import { VersionRepository } from '../repository/version.repository';

export class PublishService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly versionRepository: VersionRepository
  ) {}

  async publishDraft(diagramId: string, userId: string, revisionNumber: number): Promise<DiagramVersion> {
    const draft = await this.versionRepository.findDraftByDiagramId(diagramId);
    if (!draft) throw new Error('DRAFT_NOT_FOUND');

    if (draft.revisionNumber !== revisionNumber) {
      throw new Error('OPTIMISTIC_CONCURRENCY_CONFLICT');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Convert Draft to Published
      const publishedVersion = await tx.diagramVersion.update({
        where: { id: draft.id },
        data: {
          status: 'PUBLISHED',
          publishedBy: userId,
          publishedAt: new Date(),
        },
      });

      // 2. Mark all schema objects inside it as UNCHANGED to reflect the new baseline
      await tx.schemaTable.updateMany({ where: { versionId: publishedVersion.id }, data: { reviewState: 'UNCHANGED' } });
      await tx.schemaColumn.updateMany({ where: { tableId: { in: (await tx.schemaTable.findMany({ where: { versionId: publishedVersion.id }, select: { id: true } })).map(t => t.id) } }, data: { reviewState: 'UNCHANGED' } });
      await tx.schemaRelationship.updateMany({ where: { versionId: publishedVersion.id }, data: { reviewState: 'UNCHANGED' } });
      await tx.schemaNote.updateMany({ where: { versionId: publishedVersion.id }, data: { reviewState: 'UNCHANGED' } });

      // 3. Update Diagram
      await tx.diagram.update({
        where: { id: diagramId },
        data: {
          latestPublishedVersionId: publishedVersion.id,
          activeDraftVersionId: null, // Draft is consumed
        },
      });

      return publishedVersion;
    });
  }
}
