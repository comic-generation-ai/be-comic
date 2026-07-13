import { Module } from '@nestjs/common';
import { FramesService } from './frames.service';
import { FramesController } from './frames.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Frame } from './entities/frame.entity';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Frame]), StorageModule],
  controllers: [FramesController],
  providers: [FramesService],
  exports: [FramesService]
})
export class FramesModule { }
