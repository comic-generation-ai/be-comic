import { Injectable } from '@nestjs/common';
import { CreateSpeechBubbleDto } from './dto/create-speech-bubble.dto';
import { UpdateSpeechBubbleDto } from './dto/update-speech-bubble.dto';

@Injectable()
export class SpeechBubblesService {
  create(createSpeechBubbleDto: CreateSpeechBubbleDto) {
    return 'This action adds a new speechBubble';
  }

  findAll() {
    return `This action returns all speechBubbles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} speechBubble`;
  }

  update(id: number, updateSpeechBubbleDto: UpdateSpeechBubbleDto) {
    return `This action updates a #${id} speechBubble`;
  }

  remove(id: number) {
    return `This action removes a #${id} speechBubble`;
  }
}
