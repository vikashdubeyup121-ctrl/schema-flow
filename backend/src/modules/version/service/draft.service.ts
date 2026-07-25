import { PrismaClient, DiagramVersion, Prisma } from '@prisma/client';
import { VersionRepository } from '../repository/version.repository';

export class DraftService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly versionRepository: VersionRepository
  ) {}

  async createDraft(diagramId: string, userId: string): Promise<DiagramVersion> {
    // A diagram can only have ONE active draft at a time.
    const existingDraft = await this.versionRepository.findDraftByDiagramId(diagramId);
    if (existingDraft) {
      throw new Error('DRAFT_ALREADY_EXISTS');
    }

    const latestPublished = await this.versionRepository.findPublishedByDiagramId(diagramId);
    if (!latestPublished) {
      throw new Error('PUBLISHED_VERSION_NOT_FOUND');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the new Draft version
      const draft = await this.versionRepository.createDraft(
        tx,
        diagramId,
        latestPublished.id,
        userId,
        latestPublished.versionNumber + 1
      );

      // 2. Clone Schema Objects from latestPublished to draft
      // We clone Tables, Columns, Relationships, Notes and reset their reviewState to 'UNCHANGED'
      
      const tables = await tx.schemaTable.findMany({ where: { versionId: latestPublished.id }, include: { columns: true } });
      const tableIdMap = new Map<string, string>(); // oldTableId -> newTableId
      const columnIdMap = new Map<string, string>(); // oldColumnId -> newColumnId

      for (const table of tables) {
        const newTable = await tx.schemaTable.create({
          data: {
            versionId: draft.id,
            lineageId: table.lineageId,
            name: table.name,
            description: table.description,
            color: table.color,
            x: table.x,
            y: table.y,
            width: table.width,
            collapsed: table.collapsed,
            reviewState: 'UNCHANGED',
          }
        });
        tableIdMap.set(table.id, newTable.id);

        for (const col of table.columns) {
          const newCol = await tx.schemaColumn.create({
            data: {
              tableId: newTable.id,
              lineageId: col.lineageId,
              name: col.name,
              datatype: col.datatype,
              nullable: col.nullable,
              primaryKey: col.primaryKey,
              uniqueKey: col.uniqueKey,
              defaultValue: col.defaultValue,
              note: col.note,
              position: col.position,
              reviewState: 'UNCHANGED',
            }
          });
          columnIdMap.set(col.id, newCol.id);
        }
      }

      // Clone relationships mapping new table/column IDs
      const relationships = await tx.schemaRelationship.findMany({ where: { versionId: latestPublished.id } });
      for (const rel of relationships) {
        // Only clone if both endpoints were successfully cloned
        const srcTableId = tableIdMap.get(rel.sourceTableId);
        const srcColId = columnIdMap.get(rel.sourceColumnId);
        const tgtTableId = tableIdMap.get(rel.targetTableId);
        const tgtColId = columnIdMap.get(rel.targetColumnId);

        if (srcTableId && srcColId && tgtTableId && tgtColId) {
          await tx.schemaRelationship.create({
            data: {
              versionId: draft.id,
              lineageId: rel.lineageId,
              sourceTableId: srcTableId,
              sourceColumnId: srcColId,
              targetTableId: tgtTableId,
              targetColumnId: tgtColId,
              relationshipType: rel.relationshipType,
              reviewState: 'UNCHANGED',
            }
          });
        }
      }

      // Clone notes
      const notes = await tx.schemaNote.findMany({ where: { versionId: latestPublished.id } });
      for (const note of notes) {
        await tx.schemaNote.create({
          data: {
            versionId: draft.id,
            lineageId: note.lineageId,
            title: note.title,
            markdown: note.markdown,
            color: note.color,
            x: note.x,
            y: note.y,
            width: note.width,
            height: note.height,
            reviewState: 'UNCHANGED',
          }
        });
      }

      // 3. Update Diagram active draft
      await tx.diagram.update({
        where: { id: diagramId },
        data: { activeDraftVersionId: draft.id },
      });

      return draft;
    });
  }

  async discardDraft(diagramId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.diagramVersion.deleteMany({
        where: { diagramId, status: 'DRAFT' },
      });
      await tx.diagram.update({
        where: { id: diagramId },
        data: { activeDraftVersionId: null },
      });
    });
  }
}
