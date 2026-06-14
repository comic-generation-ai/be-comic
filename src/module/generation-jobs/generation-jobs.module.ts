import { Module } from '@nestjs/common';
import { GenerationJobsService } from './generation-jobs.service';
import { GenerationJobsController } from './generation-jobs.controller';

@Module({
  controllers: [GenerationJobsController],
  providers: [GenerationJobsService],
})
export class GenerationJobsModule {}
