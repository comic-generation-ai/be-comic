import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  GenerationJobsService,
  OrchestratorJobStatus,
  buildScriptStructuredData,
  mapOrchestratorStatus,
} from './generation-jobs.service';
import { GenerationJob } from './entities/generation-job.entity';
import { FramesService } from '../frames/frames.service';
import { ScriptsService } from '../scripts/scripts.service';
import { JobStatus, JobType } from 'src/common/constants';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('GenerationJobsService', () => {
  let service: GenerationJobsService;
  let jobRepo: jest.Mocked<Partial<Repository<GenerationJob>>>;
  let framesService: jest.Mocked<Partial<FramesService>>;
  let scriptsService: jest.Mocked<Partial<ScriptsService>>;
  let getComicJobStatus: jest.Mock;
  let startComicGeneration: jest.Mock;
  let cancelComicJob: jest.Mock;
  let dataSource: { createQueryRunner: jest.Mock };
  let projectRepo: { findOne: jest.Mock };

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
      linkScriptToProject: jest.fn().mockResolvedValue(undefined),
    };

    scriptsService = {
      createForProject: jest.fn().mockResolvedValue({ id: 'script-1' }),
    };

    getComicJobStatus = jest.fn().mockReturnValue(
      of({
        jobId: 'job-1',
        status: OrchestratorJobStatus.RUNNING,
        progressCurrent: 1,
        progressTotal: 4,
        currentStep: 'Generating panel 1/4',
        panels: [{ captionVi: 'Panel 0 text' }, { index: 1, captionVi: 'Panel 1 text' }],
      }),
    );
    startComicGeneration = jest.fn().mockReturnValue(of({ jobId: 'job-1', status: 1 }));
    cancelComicJob = jest.fn().mockReturnValue(of({ jobId: 'job-1', status: 5 }));

    const queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: { save: jest.fn() },
    };
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    projectRepo = { findOne: jest.fn() };
    jobRepo.manager = {
      getRepository: jest.fn().mockReturnValue(projectRepo),
    } as any;

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
              startComicGeneration,
              getComicJobStatus,
              cancelComicJob,
            }),
          },
        },
        {
          provide: FramesService,
          useValue: framesService,
        },
        {
          provide: ScriptsService,
          useValue: scriptsService,
        },
        {
          provide: DataSource,
          useValue: dataSource,
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

  describe('buildScriptStructuredData', () => {
    it('should map panels to docs/BA/05 schema with empty characters until proto carries bible', () => {
      const data = buildScriptStructuredData([
        {
          index: 0,
          captionVi: 'Xin chào',
          imageUrl: 'http://x',
          promptEn: 'hero standing',
          seed: 1,
          status: 'SUCCESS' as any,
          speaker: 'A',
          panelType: 'dialogue',
          speakerPosition: 'left',
        },
      ]);

      expect(data.version).toBe(1);
      expect(data.characters).toEqual({});
      expect(data.panels[0]).toMatchObject({
        panel_number: 1,
        character_ids: [],
        image_prompt: 'hero standing',
        dialogue: 'Xin chào',
        speaker: 'A',
      });
    });
  });

  describe('create', () => {
    it('throws NotFound when project missing', async () => {
      projectRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create({ projectId: 'p1', summary: 'test story' } as any, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws Forbidden when project owned by another user', async () => {
      projectRepo.findOne.mockResolvedValue({
        id: 'p1',
        user_id: 'other',
      });
      await expect(
        service.create({ projectId: 'p1', summary: 'test story' } as any, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('marks job FAILED when gRPC start fails', async () => {
      projectRepo.findOne.mockResolvedValue({
        id: 'p1',
        user_id: 'user-1',
      });
      jobRepo.create!.mockReturnValue({ id: 'job-new', status: JobStatus.QUEUED });
      jobRepo.save!.mockResolvedValue(undefined);
      startComicGeneration.mockReturnValue(throwError(() => new Error('grpc down')));

      await expect(
        service.create({ projectId: 'p1', summary: 'test story' } as any, 'user-1'),
      ).rejects.toThrow('Active pipeline AI error');
      expect(jobRepo.save).toHaveBeenCalled();
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

    it('should mark job FAILED when saveFromPanels fails on COMPLETED', async () => {
      const localJob = {
        id: 'job-1',
        project_id: 'proj-1',
        status: JobStatus.RUNNING,
        project: { user_id: 'user-1' },
      } as any;
      jobRepo.findOne.mockResolvedValue(localJob);
      getComicJobStatus.mockReturnValue(
        of({
          jobId: 'job-1',
          status: OrchestratorJobStatus.COMPLETED,
          progressCurrent: 4,
          progressTotal: 4,
          panels: [{ index: 0, captionVi: 'done', promptEn: 'p', imageUrl: 'u', seed: 1 }],
        }),
      );
      framesService.saveFromPanels.mockRejectedValue(new Error('db error'));

      const res = await service.findOne('job-1', 'user-1');

      expect(res.localJob.status).toBe(JobStatus.FAILED);
      expect(res.localJob.error_message).toContain('Persist frames/script failed');
      expect(jobRepo.save).toHaveBeenCalled();
    });

    it('should persist script and link frames when job COMPLETED', async () => {
      const localJob = {
        id: 'job-1',
        project_id: 'proj-1',
        status: JobStatus.RUNNING,
        project: { user_id: 'user-1' },
      } as any;
      jobRepo.findOne.mockResolvedValue(localJob);
      getComicJobStatus.mockReturnValue(
        of({
          jobId: 'job-1',
          status: OrchestratorJobStatus.COMPLETED,
          progressCurrent: 4,
          progressTotal: 4,
          panels: [
            {
              index: 0,
              captionVi: 'done',
              promptEn: 'p',
              imageUrl: 'u',
              seed: 1,
              speaker: 'Hero',
            },
          ],
        }),
      );

      await service.findOne('job-1', 'user-1');

      expect(scriptsService.createForProject).toHaveBeenCalledWith(
        'proj-1',
        expect.objectContaining({ version: 1, panels: expect.any(Array) }),
      );
      expect(framesService.linkScriptToProject).toHaveBeenCalledWith('proj-1', 'script-1');
    });

    it('marks FAILED when orchestrator reports FAILED', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: 'job-1',
        project_id: 'proj-1',
        status: JobStatus.RUNNING,
        project: { user_id: 'user-1' },
      } as any);
      getComicJobStatus.mockReturnValue(
        of({
          jobId: 'job-1',
          status: OrchestratorJobStatus.FAILED,
          errorMessage: 'boom',
          panels: [],
        }),
      );

      const res = await service.findOne('job-1', 'user-1');
      expect(res.localJob.status).toBe(JobStatus.FAILED);
      expect(res.localJob.error_message).toBe('boom');
    });
  });

  describe('remove', () => {
    it('calls orchestrator cancel and marks job CANCELLED', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.RUNNING,
        project: { user_id: 'user-1' },
      } as any);
      jobRepo.save.mockResolvedValue(undefined);
      cancelComicJob.mockReturnValue(of({ jobId: 'job-1', status: 5 }));

      const res = await service.remove('job-1', 'user-1');

      expect(cancelComicJob).toHaveBeenCalledWith({ jobId: 'job-1' });
      expect(jobRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: JobStatus.CANCELLED }),
      );
      expect(res.status).toBe(JobStatus.CANCELLED);
    });

    it('marks CANCELLED locally when orchestrator returns NOT_FOUND', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.RUNNING,
        project: { user_id: 'user-1' },
      } as any);
      jobRepo.save.mockResolvedValue(undefined);
      cancelComicJob.mockReturnValue(
        throwError(() => Object.assign(new Error('not found'), { code: 5 })),
      );

      const res = await service.remove('job-1', 'user-1');

      expect(jobRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: JobStatus.CANCELLED }),
      );
      expect(res.status).toBe(JobStatus.CANCELLED);
    });

    it('returns idempotent response when job already CANCELLED', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.CANCELLED,
        project: { user_id: 'user-1' },
      } as any);

      const res = await service.remove('job-1', 'user-1');

      expect(cancelComicJob).not.toHaveBeenCalled();
      expect(res.status).toBe(JobStatus.CANCELLED);
    });
  });
});
