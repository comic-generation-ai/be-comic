import { Module } from '@nestjs/common';
import { GenerationJobsService } from './generation-jobs.service';
import { GenerationJobsController } from './generation-jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenerationJob } from './entities/generation-job.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { FramesModule } from '../frames/frames.module';

@Module({
  imports: [TypeOrmModule.forFeature([GenerationJob]),
  ClientsModule.register([
    {
      name: 'ORCHESTRATOR_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'orchestrator',
        protoPath: join(__dirname, '../../proto/orchestrator.proto'),
        url: process.env.ORCHESTRATOR_URL || 'localhost:50054',
      },
    },
  ]), FramesModule
  ],
  controllers: [GenerationJobsController],
  providers: [GenerationJobsService],

})
export class GenerationJobsModule { }
