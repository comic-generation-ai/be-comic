import { Module } from '@nestjs/common';
import { FramesService } from './frames.service';
import { FramesController } from './frames.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Frame } from './entities/frame.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Frame])],
  controllers: [FramesController],
  providers: [FramesService],
  exports: [FramesService]
})
export class FramesModule { }
