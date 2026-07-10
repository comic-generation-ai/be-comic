import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Frame } from './entities/frame.entity';
import { Repository } from 'typeorm';
import { PanelDto } from '../generation-jobs/dto/panel.dto';
import { FrameStatus } from 'src/common/constants';

@Injectable()
export class FramesService {
  constructor(
    @InjectRepository(Frame)
    private readonly frameRepo: Repository<Frame>,
  ) { }

  findByProject(projectId: string) {
    return this.frameRepo.find({
      where: { project_id: projectId },
      order: { order_index: 'ASC' },
      relations: { speech_bubbles: true },
    });
  }

  async saveFromPanels(projectId: string, panels: PanelDto[]) {

    for (const p of panels) {
      await this.frameRepo.upsert(
        {
          project_id: projectId,
          order_index: p.index ?? 0,
          image_prompt: p.promptEn,
          image_url: this.toObjectKey(p.imageUrl),
          caption_vi: p.captionVi,
          seed: p.seed,
          status: FrameStatus.COMPLETED,
        },
        ['project_id', 'order_index'],
      )
    }
  }

  private toObjectKey(presignedUrl: string): string {
    try {
      return new URL(presignedUrl).pathname.slice(1);
    } catch {
      return presignedUrl;
    }
  }
}
