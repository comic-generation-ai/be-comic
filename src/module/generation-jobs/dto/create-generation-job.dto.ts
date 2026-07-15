import { IsUUID, IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, MaxLength, IsIn } from 'class-validator';

export class CreateGenerationJobDto {
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    summary: string;

    @IsIn(['storybook', 'anime', 'manga', 'retro', 'american_comic'])
    @IsOptional()
    style?: string;

    @IsInt()
    @Min(1)
    @Max(10)
    @IsOptional()
    numPanels?: number;
}
