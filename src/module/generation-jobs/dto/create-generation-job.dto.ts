import { IsUUID, IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateGenerationJobDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    summary: string;

    @IsString()
    @IsOptional()
    style?: string;

    @IsInt()
    @Min(1)
    @Max(10)
    @IsOptional()
    numPanels?: number;
}
