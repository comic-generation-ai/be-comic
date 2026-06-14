import { Injectable } from '@nestjs/common';
import { CreateGenerationJobDto } from './dto/create-generation-job.dto';
import { UpdateGenerationJobDto } from './dto/update-generation-job.dto';

@Injectable()
export class GenerationJobsService {
  create(createGenerationJobDto: CreateGenerationJobDto) {
    return 'This action adds a new generationJob';
  }

  findAll() {
    return `This action returns all generationJobs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} generationJob`;
  }

  update(id: number, updateGenerationJobDto: UpdateGenerationJobDto) {
    return `This action updates a #${id} generationJob`;
  }

  remove(id: number) {
    return `This action removes a #${id} generationJob`;
  }
}
