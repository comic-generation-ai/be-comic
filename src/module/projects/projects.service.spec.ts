import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';

describe('ProjectsService ownership', () => {
  let service: ProjectsService;
  let projectRepo: { findOne: jest.Mock; find: jest.Mock; save: jest.Mock; softDelete: jest.Mock; create: jest.Mock };

  beforeEach(async () => {
    projectRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
      create: jest.fn((x) => x),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: projectRepo },
      ],
    }).compile();

    service = module.get(ProjectsService);
  });

  it('findOne throws NotFound when missing', async () => {
    projectRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('p1', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('findOne throws Forbidden for wrong owner', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', user_id: 'other' });
    await expect(service.findOne('p1', 'u1')).rejects.toThrow(ForbiddenException);
  });

  it('findOne returns project for owner', async () => {
    const project = { id: 'p1', user_id: 'u1' };
    projectRepo.findOne.mockResolvedValue(project);
    await expect(service.findOne('p1', 'u1')).resolves.toEqual(project);
  });

  it('remove soft-deletes when owner matches', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 'p1', user_id: 'u1' });
    projectRepo.softDelete.mockResolvedValue(undefined);
    const res = await service.remove('p1', 'u1');
    expect(projectRepo.softDelete).toHaveBeenCalledWith('p1');
    expect(res.deleted).toBe(true);
  });
});
