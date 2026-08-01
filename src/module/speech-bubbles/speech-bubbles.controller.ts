import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { SpeechBubblesService } from './speech-bubbles.service';
import { CreateSpeechBubbleDto } from './dto/create-speech-bubble.dto';
import { UpdateSpeechBubbleDto } from './dto/update-speech-bubble.dto';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('speech-bubbles')
export class SpeechBubblesController {
  constructor(private readonly speechBubblesService: SpeechBubblesService) {}

  @Post()
  create(
    @Body() createSpeechBubbleDto: CreateSpeechBubbleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.speechBubblesService.create(createSpeechBubbleDto, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.speechBubblesService.findAll(user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.speechBubblesService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSpeechBubbleDto: UpdateSpeechBubbleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.speechBubblesService.update(id, updateSpeechBubbleDto, user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.speechBubblesService.remove(id, user.userId);
  }
}
