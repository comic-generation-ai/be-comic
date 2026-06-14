import { PartialType } from '@nestjs/mapped-types';
import { CreateGenerationJobDto } from './create-generation-job.dto';

export class UpdateGenerationJobDto extends PartialType(CreateGenerationJobDto) {}
