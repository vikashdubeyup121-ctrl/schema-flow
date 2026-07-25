import { ProjectRepository } from '../repository/project.repository';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { Project } from '@prisma/client';

export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async create(ownerId: string, dto: CreateProjectDto): Promise<Project> {
    const count = await this.projectRepository.countByOwner(ownerId);
    if (count >= 100) {
      throw new Error('PROJECT_LIMIT_REACHED');
    }
    return this.projectRepository.create(ownerId, dto.name, dto.description);
  }

  async findById(userId: string, id: string, requiredRole: 'OWNER' | 'EDITOR' | 'VIEWER' = 'VIEWER'): Promise<any> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }
    
    if (project.ownerId === userId) {
      return project;
    }

    const member = project.members.find((m: any) => m.userId === userId);
    if (!member) {
      throw new Error('FORBIDDEN');
    }

    if (requiredRole === 'OWNER') {
      throw new Error('FORBIDDEN');
    }

    if (requiredRole === 'EDITOR' && member.role === 'VIEWER') {
      throw new Error('FORBIDDEN');
    }

    return project;
  }

  async list(userId: string, page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    
    let projects;
    if (search) {
      projects = await this.projectRepository.searchByOwner(userId, search, skip, limit);
    } else {
      projects = await this.projectRepository.findByOwner(userId, skip, limit);
    }
    
    const total = await this.projectRepository.countByOwner(userId);
    
    return { projects, total };
  }

  async update(userId: string, id: string, dto: UpdateProjectDto): Promise<Project> {
    await this.findById(userId, id, 'EDITOR');
    return this.projectRepository.update(id, dto);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.findById(userId, id, 'OWNER');
    await this.projectRepository.softDelete(id);
  }

  async addMember(ownerId: string, projectId: string, email: string, role: 'EDITOR' | 'VIEWER') {
    await this.findById(ownerId, projectId, 'OWNER');
    
    const user = await this.projectRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    
    if (user.id === ownerId) {
      throw new Error('CANNOT_INVITE_OWNER');
    }
    
    try {
      return await this.projectRepository.addMember(projectId, user.id, role);
    } catch (e: any) {
      if (e.code === 'P2002') throw new Error('USER_ALREADY_MEMBER');
      throw e;
    }
  }

  async getMembers(userId: string, projectId: string) {
    await this.findById(userId, projectId, 'VIEWER');
    return this.projectRepository.getMembers(projectId);
  }

  async removeMember(ownerId: string, projectId: string, targetUserId: string) {
    await this.findById(ownerId, projectId, 'OWNER');
    return this.projectRepository.removeMember(projectId, targetUserId);
  }

  async updateMemberRole(ownerId: string, projectId: string, targetUserId: string, role: 'EDITOR' | 'VIEWER') {
    await this.findById(ownerId, projectId, 'OWNER');
    return this.projectRepository.updateMemberRole(projectId, targetUserId, role);
  }
}
