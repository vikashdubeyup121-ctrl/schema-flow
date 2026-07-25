import { PrismaClient, Project } from '@prisma/client';

export class ProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(ownerId: string, name: string, description?: string): Promise<Project> {
    return this.prisma.project.create({
      data: { ownerId, name, description },
    });
  }

  async findById(id: string): Promise<Project | null> {
    return this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByOwner(ownerId: string, skip: number, take: number): Promise<any[]> {
    return this.prisma.project.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
      include: {
        _count: {
          select: { diagrams: { where: { deletedAt: null } } },
        },
      },
    });
  }

  async searchByOwner(ownerId: string, query: string, skip: number, take: number): Promise<any[]> {
    return this.prisma.project.findMany({
      where: {
        ownerId,
        deletedAt: null,
        name: { contains: query, mode: 'insensitive' },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
      include: {
        _count: {
          select: { diagrams: { where: { deletedAt: null } } },
        },
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string }): Promise<Project> {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Project> {
    return this.prisma.$transaction(async (tx) => {
      // Future: cascade soft delete to diagrams, versions, drafts
      return tx.project.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }

  async countByOwner(ownerId: string): Promise<number> {
    return this.prisma.project.count({
      where: { ownerId, deletedAt: null },
    });
  }
}
