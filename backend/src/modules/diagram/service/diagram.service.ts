import { DiagramRepository } from '../repository/diagram.repository';
import { CreateDiagramDto, UpdateDiagramDto, ViewportDto } from '../dto/diagram.dto';
import { ProjectRepository } from '../../project/repository/project.repository';
import { Diagram } from '@prisma/client';

export class DiagramService {
  constructor(
    private readonly diagramRepository: DiagramRepository,
    private readonly projectRepository: ProjectRepository
  ) {}

  async create(userId: string, projectId: string, dto: CreateDiagramDto): Promise<Diagram> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    if (project.ownerId !== userId) throw new Error('FORBIDDEN');

    return this.diagramRepository.create(projectId, dto.name, dto.description, userId);
  }

  async list(userId: string, projectId: string): Promise<Diagram[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    if (project.ownerId !== userId) throw new Error('FORBIDDEN');

    return this.diagramRepository.findByProject(projectId);
  }

  async get(userId: string, id: string): Promise<Diagram> {
    const diagram = await this.diagramRepository.findById(id);
    if (!diagram) throw new Error('DIAGRAM_NOT_FOUND');

    const project = await this.projectRepository.findById(diagram.projectId);
    if (!project || project.ownerId !== userId) throw new Error('FORBIDDEN');

    return diagram;
  }

  async update(userId: string, id: string, dto: UpdateDiagramDto): Promise<Diagram> {
    await this.get(userId, id); // validates ownership and existence
    return this.diagramRepository.update(id, dto);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.get(userId, id); // validates ownership and existence
    await this.diagramRepository.softDelete(id);
  }

  async saveViewport(userId: string, id: string, dto: ViewportDto): Promise<Diagram> {
    await this.get(userId, id); // validates ownership and existence
    return this.diagramRepository.saveViewport(id, dto.x, dto.y, dto.zoom);
  }

  async publish(userId: string, id: string): Promise<Diagram> {
    await this.get(userId, id); // validates ownership and existence
    return this.diagramRepository.publish(id, userId);
  }
}
