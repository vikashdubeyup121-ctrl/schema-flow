import { PrismaClient, Diagram } from '@prisma/client';

export class DiagramRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(projectId: string, name: string, description: string | undefined, userId: string): Promise<Diagram> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Diagram
      const diagram = await tx.diagram.create({
        data: {
          projectId,
          name,
          description,
        },
      });

      // 2. Create Published Version 1
      const version1 = await tx.diagramVersion.create({
        data: {
          diagramId: diagram.id,
          versionNumber: 1,
          status: 'PUBLISHED',
          createdBy: userId,
          publishedBy: userId,
          publishedAt: new Date(),
        },
      });

      // 3. Create Draft Version
      const draft = await tx.diagramVersion.create({
        data: {
          diagramId: diagram.id,
          versionNumber: 2,
          status: 'DRAFT',
          basedOnVersionId: version1.id,
          createdBy: userId,
        },
      });

      // 4. Update diagram with version references
      return tx.diagram.update({
        where: { id: diagram.id },
        data: {
          latestPublishedVersionId: version1.id,
          activeDraftVersionId: draft.id,
        },
      });
    });
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.diagram.findFirst({
      where: { id, deletedAt: null },
      include: { 
        updatedByUser: { select: { name: true } },
        versions: {
          select: { id: true, diagramId: true, versionNumber: true, status: true, basedOnVersionId: true, createdBy: true, publishedBy: true, revisionNumber: true, createdAt: true, publishedAt: true, publishedByUser: { select: { name: true, email: true } } }
        } 
      },
    });
  }

  
  async findVersionById(versionId: string): Promise<any | null> {
    return this.prisma.diagramVersion.findFirst({
      where: { id: versionId },
      include: { publishedByUser: { select: { name: true, email: true } } }
    });
  }

  async findByProject(projectId: string): Promise<any[]> {
    return this.prisma.diagram.findMany({
      where: { projectId, deletedAt: null },
      include: { 
        updatedByUser: { select: { name: true } },
        versions: {
          select: { id: true, diagramId: true, versionNumber: true, status: true, basedOnVersionId: true, createdBy: true, publishedBy: true, revisionNumber: true, createdAt: true, publishedAt: true, publishedByUser: { select: { name: true, email: true } } }
        }
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async update(id: string, data: { name?: string; description?: string; dslText?: string; nodesData?: any; updatedBy?: string }): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const diagram = await tx.diagram.update({
        where: { id },
        data,
        include: { 
          updatedByUser: { select: { name: true } },
          versions: {
            select: { id: true, diagramId: true, versionNumber: true, status: true, basedOnVersionId: true, createdBy: true, publishedBy: true, revisionNumber: true, createdAt: true, publishedAt: true, publishedByUser: { select: { name: true, email: true } } }
          }
        },
      });

      if (data.dslText && diagram.activeDraftVersionId) {
        // We need to parse the DSL and populate the schema tables to reflect reality in the DB.
        const { parseDsl } = await import('../parser/dslParser');
        const ast = parseDsl(data.dslText);

        // Wipe existing tables/relationships/notes for this version
        await tx.schemaTable.deleteMany({
          where: { versionId: diagram.activeDraftVersionId },
        });
        await tx.schemaNote.deleteMany({
          where: { versionId: diagram.activeDraftVersionId },
        });

        // Insert new tables and columns
        const crypto = await import('crypto');
        
        // Build an in-memory map of table/col names to IDs so we can build relationships
        const tableNameToId = new Map<string, string>();
        const colNameToId = new Map<string, string>();

        for (let i = 0; i < ast.tables.length; i++) {
          const table = ast.tables[i];
          const tableId = crypto.randomUUID();
          tableNameToId.set(table.name, tableId);

          const columnsData = table.columns.map((col, colIdx) => {
            const colId = crypto.randomUUID();
            colNameToId.set(`${table.name}.${col.name}`, colId);
            return {
              id: colId,
              lineageId: colId,
              name: col.name,
              datatype: col.dataType,
              nullable: !col.primaryKey && !col.notNull,
              primaryKey: col.primaryKey,
              uniqueKey: col.unique,
              defaultValue: col.defaultValue,
              position: colIdx,
            };
          });

          await tx.schemaTable.create({
            data: {
              id: tableId,
              versionId: diagram.activeDraftVersionId,
              lineageId: tableId,
              name: table.name,
              color: '#4f46e5', // default color or compute from name
              x: data.nodesData?.[table.name]?.x ?? 0,
              y: data.nodesData?.[table.name]?.y ?? 0,
              columns: {
                create: columnsData,
              },
            },
          });
        }

        // Insert relationships
        for (const ref of ast.refs) {
          const sourceTableId = tableNameToId.get(ref.fromTable);
          const sourceColumnId = colNameToId.get(`${ref.fromTable}.${ref.fromColumn}`);
          const targetTableId = tableNameToId.get(ref.toTable);
          const targetColumnId = colNameToId.get(`${ref.toTable}.${ref.toColumn}`);

          if (sourceTableId && sourceColumnId && targetTableId && targetColumnId) {
            const relType =
              ref.type === '>' ? 'MANY_TO_ONE' :
              ref.type === '<' ? 'ONE_TO_MANY' : 'ONE_TO_ONE';

            const relId = crypto.randomUUID();
            await tx.schemaRelationship.create({
              data: {
                id: relId,
                versionId: diagram.activeDraftVersionId,
                lineageId: relId,
                sourceTableId,
                sourceColumnId,
                targetTableId,
                targetColumnId,
                relationshipType: relType,
              },
            });
          }
        }

        // Insert notes
        for (const note of ast.notes) {
          const noteId = crypto.randomUUID();
          await tx.schemaNote.create({
            data: {
              id: noteId,
              versionId: diagram.activeDraftVersionId,
              lineageId: noteId,
              title: note.title,
              markdown: note.content,
              color: note.color,
              x: data.nodesData?.[`note-${note.title}`]?.x ?? 0,
              y: data.nodesData?.[`note-${note.title}`]?.y ?? 0,
            },
          });
        }
      }

      return diagram;
    });
  }

  async saveViewport(id: string, x: number, y: number, zoom: number): Promise<Diagram> {
    return this.prisma.diagram.update({
      where: { id },
      data: { viewportX: x, viewportY: y, viewportZoom: zoom },
    });
  }

  async softDelete(id: string): Promise<Diagram> {
    return this.prisma.$transaction(async (tx) => {
      // Future: Soft delete versions etc.
      return tx.diagram.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }

  async publish(id: string, userId: string): Promise<Diagram> {
    return this.prisma.$transaction(async (tx) => {
      const diagram = await tx.diagram.findUniqueOrThrow({
        where: { id },
        include: { versions: true }
      });

      if (!diagram.activeDraftVersionId) return diagram;

      // If the draft code is identical to the published code, there's nothing new to publish.
      if (diagram.dslText === diagram.publishedDslText) {
        return diagram;
      }

      // 1. Mark current draft as published
      const publishedVersion = await tx.diagramVersion.update({
        where: { id: diagram.activeDraftVersionId },
        data: {
          status: 'PUBLISHED',
          publishedBy: userId,
          publishedAt: new Date(),
          dslText: diagram.dslText,
        }
      });

      // 2. Reset review states for objects in this version (optional, but good for "unchanged")
      await tx.schemaTable.updateMany({
        where: { versionId: publishedVersion.id },
        data: { reviewState: 'UNCHANGED' }
      });
      await tx.schemaColumn.updateMany({
        where: { table: { versionId: publishedVersion.id } },
        data: { reviewState: 'UNCHANGED' }
      });
      await tx.schemaRelationship.updateMany({
        where: { versionId: publishedVersion.id },
        data: { reviewState: 'UNCHANGED' }
      });
      await tx.schemaNote.updateMany({
        where: { versionId: publishedVersion.id },
        data: { reviewState: 'UNCHANGED' }
      });

      // 3. Create a new draft based on this newly published version
      const nextVersionNumber = diagram.versions.length + 1;
      const newDraft = await tx.diagramVersion.create({
        data: {
          diagramId: diagram.id,
          versionNumber: nextVersionNumber,
          status: 'DRAFT',
          basedOnVersionId: publishedVersion.id,
          createdBy: userId,
        }
      });

      // Copy tables, columns, rels to the new draft? 
      // Actually, since we completely rebuild it from DSL on every save, 
      // we don't strictly need to copy them right now, they will be built on next save.
      // But let's copy them just so they exist in DB before the next save.
      // Or just let the DSL sync do it on next save. Let's just create the draft.

      // 4. Update Diagram pointers
      return tx.diagram.update({
        where: { id: diagram.id },
        data: {
          latestPublishedVersionId: publishedVersion.id,
          activeDraftVersionId: newDraft.id,
          publishedDslText: diagram.dslText,
        },
        include: {
          updatedByUser: { select: { name: true } },
          versions: {
            select: { id: true, diagramId: true, versionNumber: true, status: true, basedOnVersionId: true, createdBy: true, publishedBy: true, revisionNumber: true, createdAt: true, publishedAt: true, publishedByUser: { select: { name: true, email: true } } }
          }
        }
      });
    });
  }
}
