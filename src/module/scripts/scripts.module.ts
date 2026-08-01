import { Module } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Script } from './entities/script.entity';

/**
 * [story-p0-be-security-payment] Changed: removed public ScriptsController; service kept for internal use (story-be-script-persist).
 */
@Module({
  imports: [TypeOrmModule.forFeature([Script])],
  providers: [ScriptsService],
  exports: [ScriptsService],
})
export class ScriptsModule {}
