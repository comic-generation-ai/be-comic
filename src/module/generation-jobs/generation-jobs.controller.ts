import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GenerationJobsService } from './generation-jobs.service';
import { CreateGenerationJobDto } from './dto/create-generation-job.dto';
import { UpdateGenerationJobDto } from './dto/update-generation-job.dto';

@Controller('generation-jobs')
export class GenerationJobsController {
  constructor(private readonly generationJobsService: GenerationJobsService) {}

  @Post()
  create(@Body() createGenerationJobDto: CreateGenerationJobDto) {
    return this.generationJobsService.create(createGenerationJobDto);
  }

  @Get()
  findAll() {
    return this.generationJobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.generationJobsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGenerationJobDto: UpdateGenerationJobDto) {
    return this.generationJobsService.update(+id, updateGenerationJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.generationJobsService.remove(+id);
  }
}
