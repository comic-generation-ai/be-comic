import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Script } from './entities/script.entity';

/** Schema docs/BA/05 §4 — characters filled when orchestrator proto carries bible (future). */
export interface ScriptStructuredData {
  version: number;
  story_title: string;
  characters: Record<string, { name: string; visual_tag: string }>;
  panels: Array<{
    panel_number: number;
    character_ids: string[];
    image_prompt: string;
    dialogue: string;
    speaker: string;
    panel_type?: string;
    speaker_position?: string;
  }>;
}

@Injectable()
export class ScriptsService {
  constructor(
    @InjectRepository(Script)
    private readonly scriptRepo: Repository<Script>,
  ) {}

  /**
   * [story-be-script-persist] Changed: internal-only persist to COMIC_SCRIPT.structured_data (no public API).
   */
  async createForProject(
    projectId: string,
    structuredData: ScriptStructuredData,
  ): Promise<Script> {
    const script = this.scriptRepo.create({
      project_id: projectId,
      structured_data: structuredData as unknown as Record<string, any>,
      version: structuredData.version ?? 1,
    });
    return this.scriptRepo.save(script);
  }
}
