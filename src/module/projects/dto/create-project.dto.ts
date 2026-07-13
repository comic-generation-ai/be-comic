import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    rawPrompt: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    genre?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    artStyle?: string;
}
