import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './module/users/users.module';
import { ProjectsModule } from './module/projects/projects.module';
import { ScriptsModule } from './module/scripts/scripts.module';
import { TransactionsModule } from './module/transactions/transactions.module';
import { CharactersModule } from './module/characters/characters.module';
import { FramesModule } from './module/frames/frames.module';
import { SpeechBubblesModule } from './module/speech-bubbles/speech-bubbles.module';
import { GenerationJobsModule } from './module/generation-jobs/generation-jobs.module';

@Module({
  imports: [UsersModule, ProjectsModule, ScriptsModule, TransactionsModule, CharactersModule, FramesModule, SpeechBubblesModule, GenerationJobsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
