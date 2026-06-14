import { PartialType } from '@nestjs/mapped-types';
import { CreateSpeechBubbleDto } from './create-speech-bubble.dto';

export class UpdateSpeechBubbleDto extends PartialType(CreateSpeechBubbleDto) {}
