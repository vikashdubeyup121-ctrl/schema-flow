import { DiagramRepository } from '../repository/diagram.repository';
import { CreateDiagramDto, UpdateDiagramDto, ViewportDto } from '../dto/diagram.dto';
import { ProjectService } from '../../project/service/project.service';
import { Diagram } from '@prisma/client';

export class DiagramService {
  constructor(
    private readonly diagramRepository: DiagramRepository,
    private readonly projectService: ProjectService
  ) {}

  async create(userId: string, projectId: string, dto: CreateDiagramDto): Promise<Diagram> {
    await this.projectService.findById(userId, projectId, 'EDITOR');
    return this.diagramRepository.create(projectId, dto.name, dto.description, userId);
  }

  async list(userId: string, projectId: string): Promise<Diagram[]> {
    await this.projectService.findById(userId, projectId, 'VIEWER');
    return this.diagramRepository.findByProject(projectId);
  }

  async get(userId: string, id: string, requiredRole: 'OWNER' | 'EDITOR' | 'VIEWER' = 'VIEWER'): Promise<Diagram> {
    const diagram = await this.diagramRepository.findById(id);
    if (!diagram) throw new Error('DIAGRAM_NOT_FOUND');

    await this.projectService.findById(userId, diagram.projectId, requiredRole);
    return diagram;
  }

  
  async getVersion(userId: string, diagramId: string, versionId: string): Promise<any> {
    const diagram = await this.diagramRepository.findById(diagramId);
    if (!diagram) throw new Error('DIAGRAM_NOT_FOUND');
    await this.projectService.findById(userId, diagram.projectId, 'VIEWER');
    const version = await this.diagramRepository.findVersionById(versionId);
    if (!version || version.diagramId !== diagramId) throw new Error('VERSION_NOT_FOUND');
    return version;
  }

  async update(userId: string, id: string, dto: UpdateDiagramDto): Promise<Diagram> {
    await this.get(userId, id, 'EDITOR'); // validates ownership and existence
    return this.diagramRepository.update(id, { ...dto, updatedBy: userId });
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.get(userId, id, 'OWNER'); // validates ownership and existence
    await this.diagramRepository.softDelete(id);
  }

  async saveViewport(userId: string, id: string, dto: ViewportDto): Promise<Diagram> {
    await this.get(userId, id, 'EDITOR'); // validates ownership and existence
    return this.diagramRepository.saveViewport(id, dto.x, dto.y, dto.zoom);
  }

  async publish(userId: string, id: string): Promise<Diagram> {
    await this.get(userId, id, 'EDITOR'); // validates ownership and existence
    return this.diagramRepository.publish(id, userId);
  }
}
