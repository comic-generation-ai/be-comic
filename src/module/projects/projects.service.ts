import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) { }

  create(dto: CreateProjectDto, userId: string) {
    const project = this.projectRepo.create({
      user_id: userId,
      title: dto.title,
      raw_prompt: dto.rawPrompt,
      genre: dto.genre,
      art_style: dto.artStyle,
    });
    return this.projectRepo.save(project);
  }

  findAll(userId: string) {
    return this.projectRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: { frames: true },
      order: { frames: { order_index: 'ASC' } },
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.findOne(id);
    Object.assign(project, {
      title: dto.title ?? project.title,
      raw_prompt: dto.rawPrompt ?? project.raw_prompt,
      genre: dto.genre ?? project.genre,
      art_style: dto.artStyle ?? project.art_style,
    });
    return this.projectRepo.save(project);
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id);
    if (project.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa project này');
    }
    await this.projectRepo.softDelete(id);
    return { id, deleted: true };
  }
}
