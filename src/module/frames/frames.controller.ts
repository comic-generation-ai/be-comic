import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { FramesService } from './frames.service';

@Controller('frames')
export class FramesController {
  constructor(private readonly framesService: FramesService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  findByProject(@Query('projectId') projectId: string) {
    return this.framesService.findByProject(projectId);
  }

  @Get(':id/image-url')
  @HttpCode(HttpStatus.OK)
  getImageUrl(@Param('id', ParseUUIDPipe) id: string) {
    return this.framesService.getImageUrl(id);
  }
}
