import { IsUUID, IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateGenerationJobDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    summary: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    style?: string;

    @IsInt()
    @Min(1)
    @Max(10)
    @IsOptional()
    numPanels?: number;
}
