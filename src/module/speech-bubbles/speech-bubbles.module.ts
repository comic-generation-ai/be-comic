import { Module } from '@nestjs/common';
import { SpeechBubblesService } from './speech-bubbles.service';
import { SpeechBubblesController } from './speech-bubbles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpeechBubble } from './entities/speech-bubble.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpeechBubble])],
  controllers: [SpeechBubblesController],
  providers: [SpeechBubblesService],
})
export class SpeechBubblesModule {}
