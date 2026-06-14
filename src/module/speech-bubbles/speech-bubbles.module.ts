import { Module } from '@nestjs/common';
import { SpeechBubblesService } from './speech-bubbles.service';
import { SpeechBubblesController } from './speech-bubbles.controller';

@Module({
  controllers: [SpeechBubblesController],
  providers: [SpeechBubblesService],
})
export class SpeechBubblesModule {}
