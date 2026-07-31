import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  GenerationJobsService,
  OrchestratorJobStatus,
  mapOrchestratorStatus,
} from './generation-jobs.service';
import { GenerationJob } from './entities/generation-job.entity';
import { FramesService } from '../frames/frames.service';
import { JobStatus, JobType } from 'src/common/constants';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';

describe('GenerationJobsService', () => {
  let service: GenerationJobsService;
  let jobRepo: jest.Mocked<Partial<Repository<GenerationJob>>>;
  let framesService: jest.Mocked<Partial<FramesService>>;

  beforeEach(async () => {
    jobRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      manager: {
        getRepository: jest.fn(),
      } as any,
    };

    framesService = {
      saveFromPanels: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerationJobsService,
        {
          provide: getRepositoryToken(GenerationJob),
          useValue: jobRepo,
        },
        {
          provide: 'ORCHESTRATOR_PACKAGE',
          useValue: {
            getService: () => ({
              startComicGeneration: jest.fn().mockReturnValue(of({ jobId: 'job-1', status: 1 })),
              getComicJobStatus: jest.fn().mockReturnValue(
                of({
                  jobId: 'job-1',
                  status: OrchestratorJobStatus.RUNNING,
                  progressCurrent: 1,
                  progressTotal: 4,
                  currentStep: 'Generating panel 1/4',
                  panels: [{ captionVi: 'Panel 0 text' }, { index: 1, captionVi: 'Panel 1 text' }],
                }),
              ),
              cancelComicJob: jest.fn().mockReturnValue(of({ jobId: 'job-1', status: 5 })),
            }),
          },
        },
        {
          provide: FramesService,
          useValue: framesService,
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GenerationJobsService>(GenerationJobsService);
    service.onModuleInit();
  });

  describe('mapOrchestratorStatus', () => {
    it('should map numeric orchestrator statuses to business JobStatus string', () => {
      expect(mapOrchestratorStatus(OrchestratorJobStatus.QUEUED, JobStatus.QUEUED)).toBe(
        JobStatus.QUEUED,
      );
      expect(mapOrchestratorStatus(OrchestratorJobStatus.RUNNING, JobStatus.RUNNING)).toBe(
        JobStatus.RUNNING,
      );
      expect(mapOrchestratorStatus(OrchestratorJobStatus.COMPLETED, JobStatus.COMPLETED)).toBe(
        JobStatus.COMPLETED,
      );
      expect(mapOrchestratorStatus(OrchestratorJobStatus.FAILED, JobStatus.FAILED)).toBe(
        JobStatus.FAILED,
      );
      expect(mapOrchestratorStatus(OrchestratorJobStatus.CANCELLED, JobStatus.CANCELLED)).toBe(
        JobStatus.CANCELLED,
      );
      expect(mapOrchestratorStatus(OrchestratorJobStatus.UNKNOWN, JobStatus.RUNNING)).toBe(
        JobStatus.RUNNING,
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if job does not exist', async () => {
      jobRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('job-999', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if job belongs to another user', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: 'job-1',
        project_id: 'proj-1',
        project: { user_id: 'user-2' },
      } as any);

      await expect(service.findOne('job-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should return liveStatus null when job is already terminal in Postgres', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: 'job-1',
        project_id: 'proj-1',
        status: JobStatus.COMPLETED,
        project: { user_id: 'user-1' },
      } as any);

      const res = await service.findOne('job-1', 'user-1');
      expect(res.liveStatus).toBeNull();
      expect(res.localJob.status).toBe(JobStatus.COMPLETED);
    });

    it('should normalize missing panel.index to array index', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: 'job-1',
        project_id: 'proj-1',
        status: JobStatus.RUNNING,
        project: { user_id: 'user-1' },
      } as any);

      const res = await service.findOne('job-1', 'user-1');
      expect(res.liveStatus).toBeDefined();
      expect(res.liveStatus.status).toBe(JobStatus.RUNNING);
      expect(res.liveStatus.panels[0].index).toBe(0);
      expect(res.liveStatus.panels[1].index).toBe(1);
    });
  });
});
