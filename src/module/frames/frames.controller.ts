import { Controller, Get, Query } from '@nestjs/common';
import { FramesService } from './frames.service';

@Controller('frames')
export class FramesController {
  constructor(private readonly framesService: FramesService) {}

  // Frame được sinh tự động từ generation-jobs (saveFromPanels) — API chỉ cần đọc.
  // FE lấy toàn bộ frame của một truyện: GET /frames?projectId=xxx
  @Get()
  findByProject(@Query('projectId') projectId: string) {
    return this.framesService.findByProject(projectId);
  }
}
