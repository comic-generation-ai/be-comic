import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { FramesService } from './frames.service';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('frames')
export class FramesController {
  constructor(private readonly framesService: FramesService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  findByProject(
    @Query('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.framesService.findByProject(projectId, user.userId);
  }

  @Get(':id/image-url')
  @HttpCode(HttpStatus.OK)
  getImageUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.framesService.getImageUrl(id, user.userId);
  }
}
