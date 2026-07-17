import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { BubbleType } from 'src/common/constants';

export class CreateSpeechBubbleDto {
  @IsUUID()
  frameId: string;

  @IsString()
  @IsNotEmpty()
  textContent: string;

  @IsEnum(BubbleType)
  bubbleType: BubbleType;

  @IsNumber()
  posX: number;

  @IsNumber()
  posY: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsString()
  @IsOptional()
  tailDirection?: string;

  @IsObject()
  @IsOptional()
  styleConfig?: Record<string, any>;
}
