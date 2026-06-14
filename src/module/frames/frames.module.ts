import { Module } from '@nestjs/common';
import { FramesService } from './frames.service';
import { FramesController } from './frames.controller';

@Module({
  controllers: [FramesController],
  providers: [FramesService],
})
export class FramesModule {}
