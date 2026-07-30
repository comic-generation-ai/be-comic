import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { GenerationJobsService } from './generation-jobs.service';
import { CreateGenerationJobDto } from './dto/create-generation-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('generation-jobs')
export class GenerationJobsController {
  constructor(private readonly generationJobsService: GenerationJobsService) { }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  create(
    @Body() createGenerationJobDto: CreateGenerationJobDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.generationJobsService.create(createGenerationJobDto, user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.generationJobsService.findOne(id, user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.generationJobsService.remove(id, user.userId);
  }
}
