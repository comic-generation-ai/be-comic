import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpeechBubble } from './entities/speech-bubble.entity';
import { CreateSpeechBubbleDto } from './dto/create-speech-bubble.dto';
import { UpdateSpeechBubbleDto } from './dto/update-speech-bubble.dto';

@Injectable()
export class SpeechBubblesService {
  constructor(
    @InjectRepository(SpeechBubble)
    private readonly speechBubbleRepo: Repository<SpeechBubble>,
  ) { }

  create(dto: CreateSpeechBubbleDto) {
    const bubble = this.speechBubbleRepo.create({
      frame_id: dto.frameId,
      text_content: dto.textContent,
      bubble_type: dto.bubbleType,
      pos_x: dto.posX,
      pos_y: dto.posY,
      width: dto.width,
      height: dto.height,
      tail_direction: dto.tailDirection,
      style_config: dto.styleConfig ?? {},
    });
    return this.speechBubbleRepo.save(bubble);
  }

  findAll() {
    return this.speechBubbleRepo.find();
  }

  async findOne(id: string) {
    const bubble = await this.speechBubbleRepo.findOne({ where: { id } });
    if (!bubble) throw new NotFoundException(`SpeechBubble ${id} not found`);
    return bubble;
  }

  async update(id: string, dto: UpdateSpeechBubbleDto) {
    const bubble = await this.findOne(id);
    if (dto.textContent !== undefined) bubble.text_content = dto.textContent;
    if (dto.bubbleType !== undefined) bubble.bubble_type = dto.bubbleType;
    if (dto.posX !== undefined) bubble.pos_x = dto.posX;
    if (dto.posY !== undefined) bubble.pos_y = dto.posY;
    if (dto.width !== undefined) bubble.width = dto.width;
    if (dto.height !== undefined) bubble.height = dto.height;
    if (dto.tailDirection !== undefined) bubble.tail_direction = dto.tailDirection;
    if (dto.styleConfig !== undefined) bubble.style_config = dto.styleConfig;
    return this.speechBubbleRepo.save(bubble);
  }

  async remove(id: string) {
    const bubble = await this.findOne(id);
    await this.speechBubbleRepo.remove(bubble);
    return bubble;
  }
}
