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

  async findById(id: string): Promise<Diagram | null> {
    return this.prisma.diagram.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByProject(projectId: string): Promise<Diagram[]> {
    return this.prisma.diagram.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async update(id: string, data: { name?: string; description?: string }): Promise<Diagram> {
    return this.prisma.diagram.update({
      where: { id },
      data,
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
}
