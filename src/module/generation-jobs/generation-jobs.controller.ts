import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { GenerationJobsService } from './generation-jobs.service';
import { CreateGenerationJobDto } from './dto/create-generation-job.dto';

@Controller('generation-jobs')
export class GenerationJobsController {
  constructor(private readonly generationJobsService: GenerationJobsService) { }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  create(@Body() createGenerationJobDto: CreateGenerationJobDto) {
    return this.generationJobsService.create(createGenerationJobDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.generationJobsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.generationJobsService.remove(id);
  }
}
