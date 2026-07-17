import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpeechBubblesService } from './speech-bubbles.service';
import { CreateSpeechBubbleDto } from './dto/create-speech-bubble.dto';
import { UpdateSpeechBubbleDto } from './dto/update-speech-bubble.dto';

@Controller('speech-bubbles')
export class SpeechBubblesController {
  constructor(private readonly speechBubblesService: SpeechBubblesService) {}

  @Post()
  create(@Body() createSpeechBubbleDto: CreateSpeechBubbleDto) {
    return this.speechBubblesService.create(createSpeechBubbleDto);
  }

  @Get()
  findAll() {
    return this.speechBubblesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.speechBubblesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpeechBubbleDto: UpdateSpeechBubbleDto) {
    return this.speechBubblesService.update(id, updateSpeechBubbleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.speechBubblesService.remove(id);
  }
}
