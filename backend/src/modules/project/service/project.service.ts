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

  async findById(ownerId: string, id: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }
    if (project.ownerId !== ownerId) {
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

  async update(ownerId: string, id: string, dto: UpdateProjectDto): Promise<Project> {
    await this.findById(ownerId, id); // validates ownership and existence
    return this.projectRepository.update(id, dto);
  }

  async delete(ownerId: string, id: string): Promise<void> {
    await this.findById(ownerId, id); // validates ownership and existence
    await this.projectRepository.softDelete(id);
  }
}
