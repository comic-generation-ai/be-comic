import { Module } from '@nestjs/common';
import { GenerationJobsService } from './generation-jobs.service';
import { GenerationJobsController } from './generation-jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenerationJob } from './entities/generation-job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GenerationJob])],
  controllers: [GenerationJobsController],
  providers: [GenerationJobsService],
})
export class GenerationJobsModule {}
