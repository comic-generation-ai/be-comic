import { Inject, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateGenerationJobDto } from './dto/create-generation-job.dto';
import { UpdateGenerationJobDto } from './dto/update-generation-job.dto';
import { firstValueFrom, Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GenerationJob } from './entities/generation-job.entity';
import { JobStatus, JobType } from 'src/common/constants';
// import { ClientGrpc } from '@nestjs/microservices';
import * as NestMicro from '@nestjs/microservices';
import * as crypto from 'crypto';
import { FramesService } from '../frames/frames.service';
import { PanelDto } from './dto/panel.dto';

interface StartRequest {
  jobId: string;
  userId: string;
  summary: string;
  style: string;
  numPanels: number;
  requestId: string;
}

enum OrchestratorJobStatus {
  UNKNOWN = 0,
  QUEUED = 1,
  RUNNING = 2,
  COMPLETED = 3,
  FAILED = 4,
  CANCELLED = 5,
}
interface StartResponse {
  jobId: string;
  status: number; // Enum của orchestrator
}
interface StatusRequest {
  jobId: string;
}
export interface StatusResponse {
  jobId: string;
  status: number;
  progressCurrent: number;
  progressTotal: number;
  pageImageUrl: string;
  errorMessage: string;
  currentStep: string;
  panels: PanelDto[];

}
interface CancelRequest {
  jobId: string;
}
interface CancelResponse {
  jobId: string;
  status: number;
}

function mapOrchestratorStatus(status: OrchestratorJobStatus, fallback: JobStatus): JobStatus {
  switch (status) {
    case OrchestratorJobStatus.QUEUED: return JobStatus.QUEUED;
    case OrchestratorJobStatus.RUNNING: return JobStatus.RUNNING;
    case OrchestratorJobStatus.COMPLETED: return JobStatus.COMPLETED;
    case OrchestratorJobStatus.FAILED: return JobStatus.FAILED;
    case OrchestratorJobStatus.CANCELLED: return JobStatus.CANCELLED;
    default: return fallback;
  }
}
interface ComicOrchestratorServiceClient {
  startComicGeneration(request: StartRequest): Observable<StartResponse>;
  getComicJobStatus(request: StatusRequest): Observable<StatusResponse>;
  cancelComicJob(request: CancelRequest): Observable<CancelResponse>;
}


@Injectable()
export class GenerationJobsService implements OnModuleInit {
  private orchestratorService: ComicOrchestratorServiceClient;
  constructor(
    @InjectRepository(GenerationJob)
    private readonly jobRepo: Repository<GenerationJob>,
    @Inject('ORCHESTRATOR_PACKAGE')
    private readonly grpcClient: NestMicro.ClientGrpc,
    private readonly framesService: FramesService,
    private readonly dataSource: DataSource,

  ) { }

  onModuleInit() {
    this.orchestratorService = this.grpcClient.getService<ComicOrchestratorServiceClient>(
      'ComicOrchestratorService',
    );
  }

  async create(dto: CreateGenerationJobDto, userId: string) {
    const jobId = crypto.randomUUID();
    const requestId = crypto.randomUUID();

    const job = this.jobRepo.create({
      id: jobId,
      project_id: dto.projectId,
      job_type: JobType.IMAGE_GENERATION,
      status: JobStatus.QUEUED,
      retry_count: 0,
      started_at: new Date(),
    });
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      await queryRunner.manager.save(GenerationJob, job);

      await queryRunner.commitTransaction();
    } catch (dbError) {
      await queryRunner.rollbackTransaction();
      console.error(`[Postgres Error] Cannot insert Job:`, dbError.message);
      throw new InternalServerErrorException(`System error: ${dbError.message}`);
    } finally {
      await queryRunner.release();
    }

    try {
      await firstValueFrom(
        this.orchestratorService.startComicGeneration({
          jobId,
          userId,
          summary: dto.summary,
          style: dto.style || 'storybook',
          numPanels: dto.numPanels || 4,
          requestId,
        }),
      );

      // if gRPC call completed without error, set status to RUNNING
      job.status = JobStatus.RUNNING;
      await this.jobRepo.save(job);

    } catch (grpcError) {
      console.error(`[gRPC Error] Cannot start Job:`, grpcError.message);
      job.status = JobStatus.FAILED;
      job.error_message = grpcError.message;
      job.completed_at = new Date();

      await this.jobRepo.save(job);
      throw new InternalServerErrorException(`Active pipeline AI error: ${grpcError.message}`);
    }

    return { jobId, status: job.status };
  }

  findAll() {
    return `This action returns all generationJobs`;
  }

  async findOne(id: string) {
    const localJob = await this.jobRepo.findOne({ where: { id } });
    if (!localJob) throw new NotFoundException(`Job ${id} not found`);

    if (
      localJob.status === JobStatus.COMPLETED ||
      localJob.status === JobStatus.FAILED ||
      localJob.status === JobStatus.CANCELLED
    ) {
      return { localJob, liveStatus: null };
    }

    // Async Polling Redis Orchestrator with gRPC Callback/Poll
    try {
      const liveStatus = await firstValueFrom(
        this.orchestratorService.getComicJobStatus({ jobId: id }),
      );

      // Map status từ Orchestrator (Redis, qua gRPC) -> Postgres.
      // QUEUED/RUNNING không cần ghi lại vì localJob đã ở đúng state đó rồi.
      let hasChanged = false;

      if (liveStatus.status === OrchestratorJobStatus.COMPLETED) {
        await this.framesService.saveFromPanels(localJob.project_id, liveStatus.panels);
        localJob.status = JobStatus.COMPLETED;
        localJob.completed_at = new Date();
        hasChanged = true;
      } else if (liveStatus.status === OrchestratorJobStatus.FAILED) {
        localJob.status = JobStatus.FAILED;
        localJob.error_message = liveStatus.errorMessage;
        localJob.completed_at = new Date();
        hasChanged = true;
      } else if (liveStatus.status === OrchestratorJobStatus.CANCELLED) {
        localJob.status = JobStatus.CANCELLED;
        localJob.completed_at = new Date();
        hasChanged = true;
      }

      if (hasChanged) {
        await this.jobRepo.save(localJob);
      }

      return {
        localJob,
        liveStatus: {
          ...liveStatus,
          status: mapOrchestratorStatus(liveStatus.status, localJob.status),
        },
      };
    } catch (err) {
      return { localJob, error: `Cannot connect to Orchestrator: ${err.message}` };
    }
  }

  async remove(id: string) {
    const job = await this.jobRepo.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Send cancel signal to Celery Worker infrastructure
      await firstValueFrom(this.orchestratorService.cancelComicJob({ jobId: id }));

      job.status = JobStatus.CANCELLED;
      job.completed_at = new Date();
      await queryRunner.manager.save(GenerationJob, job);

      await queryRunner.commitTransaction();
      return { jobId: id, status: job.status };
    } catch (err) {

      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Failed to cancel generation job: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
