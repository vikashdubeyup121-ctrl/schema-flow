import { PrismaClient, Project } from '@prisma/client';

export class ProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(ownerId: string, name: string, description?: string): Promise<Project> {
    return this.prisma.project.create({
      data: {
        ownerId,
        name,
        description,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER',
          },
        },
      },
    });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: { members: true },
    });
  }

  async findByOwner(userId: string, skip: number, take: number): Promise<any[]> {
    return this.prisma.project.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
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

  async searchByOwner(userId: string, query: string, skip: number, take: number): Promise<any[]> {
    return this.prisma.project.findMany({
      where: {
        deletedAt: null,
        name: { contains: query, mode: 'insensitive' },
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
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

  async countByOwner(userId: string): Promise<number> {
    return this.prisma.project.count({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
    });
  }

  async addMember(projectId: string, userId: string, role: 'EDITOR' | 'VIEWER') {
    return this.prisma.projectMember.create({
      data: { projectId, userId, role },
      include: { user: true },
    });
  }

  async getMembers(projectId: string) {
    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true, pictureUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async removeMember(projectId: string, userId: string) {
    return this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  }

  async updateMemberRole(projectId: string, userId: string, role: 'EDITOR' | 'VIEWER') {
    return this.prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: { role },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
