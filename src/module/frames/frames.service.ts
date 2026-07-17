import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Frame } from './entities/frame.entity';
import { Repository } from 'typeorm';
import { PanelDto } from '../generation-jobs/dto/panel.dto';
import { FrameStatus, BubbleType } from 'src/common/constants';
import { StorageService } from 'src/common/storage/storage.service';
import { minioConfig } from 'src/common/config';
import { SpeechBubble } from '../speech-bubbles/entities/speech-bubble.entity';

const NARRATOR_LABEL = 'Người kể chuyện';

type BubbleClassification = 'NONE' | 'NARRATION' | 'SPEECH' | 'SHOUT';

interface BubbleLayout {
  bubble_type: BubbleType;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  tail_direction: string;
}

function classifyBubble(p: PanelDto): BubbleClassification {
  const dialogue = p.captionVi?.trim();
  if (!dialogue) return 'NONE';

  const speaker = p.speaker?.trim();
  if (p.panelType === 'narration' || !speaker || speaker === NARRATOR_LABEL) {
    return 'NARRATION';
  }

  return p.panelType === 'action' ? 'SHOUT' : 'SPEECH';
}

function computeBubbleLayout(
  classification: BubbleClassification,
  speakerPosition: string | undefined,
  panelNumber: number,
): BubbleLayout | null {
  if (classification === 'NONE') return null;

  if (classification === 'NARRATION') {
    return {
      bubble_type: BubbleType.NARRATION,
      pos_x: 50,
      pos_y: 88,
      width: 240,
      height: 60,
      tail_direction: 'none',
    };
  }

  const isShout = classification === 'SHOUT';
  const validPosition =
    speakerPosition === 'left' || speakerPosition === 'right' || speakerPosition === 'center'
      ? speakerPosition
      : undefined;

  if (!validPosition && !isShout) {
    // dữ liệu cũ chưa có speaker_position — luân phiên theo panel_number
    const posX = panelNumber % 2 === 0 ? 70 : 30;
    return {
      bubble_type: BubbleType.SPEECH,
      pos_x: posX,
      pos_y: 20,
      width: 160,
      height: 100,
      tail_direction: 'down',
    };
  }

  const effectivePosition = validPosition ?? 'center';
  let posX: number;
  let tailDirection: string;
  if (effectivePosition === 'left') {
    posX = 30;
    tailDirection = 'down-left';
  } else if (effectivePosition === 'right') {
    posX = 70;
    tailDirection = 'down-right';
  } else {
    posX = panelNumber % 2 === 0 ? 70 : 30;
    tailDirection = posX === 70 ? 'down-right' : 'down-left';
  }

  return {
    bubble_type: isShout ? BubbleType.SHOUT : BubbleType.SPEECH,
    pos_x: posX,
    pos_y: isShout ? 15 : 18,
    width: isShout ? 190 : 170,
    height: isShout ? 100 : 95,
    tail_direction: tailDirection,
  };
}

@Injectable()
export class FramesService {
  constructor(
    @InjectRepository(Frame)
    private readonly frameRepo: Repository<Frame>,
    @InjectRepository(SpeechBubble)
    private readonly speechBubbleRepo: Repository<SpeechBubble>,
    private readonly storage: StorageService
  ) { }

  async getImageUrl(frameId: string) {
    const frame = await this.frameRepo.findOne({ where: { id: frameId } });
    if (!frame) throw new NotFoundException(`Frame ${frameId} not found`);
    if (!frame.image_url) throw new NotFoundException(`Frame ${frameId} chưa có ảnh`);
    const url = await this.storage.presignFromKey(frame.image_url);
    return { url, expiresInSec: minioConfig.presignExpirySec };
  }

  findByProject(projectId: string) {
    return this.frameRepo.find({
      where: { project_id: projectId },
      order: { order_index: 'ASC' },
      relations: { speech_bubbles: true },
    });
  }

  async saveFromPanels(projectId: string, panels: PanelDto[]) {

    for (const p of panels) {
      const orderIndex = p.index ?? 0;

      await this.frameRepo.upsert(
        {
          project_id: projectId,
          order_index: orderIndex,
          image_prompt: p.promptEn,
          image_url: this.toObjectKey(p.imageUrl),
          caption_vi: p.captionVi,
          seed: p.seed,
          status: FrameStatus.COMPLETED,
        },
        ['project_id', 'order_index'],
      )

      const frame = await this.frameRepo.findOne({
        where: { project_id: projectId, order_index: orderIndex },
      });
      if (!frame) continue;

      // Dọn bong bóng auto-generate cũ (job chạy lại/regenerate) trước khi tạo lại.
      // KHÔNG dùng upsert theo frame_id — COMIC_SPEECH_BUBBLE không có unique
      // constraint trên frame_id, upsert sẽ throw lỗi ON CONFLICT ở Postgres.
      await this.speechBubbleRepo.delete({ frame_id: frame.id });

      const classification = classifyBubble(p);
      const layout = computeBubbleLayout(classification, p.speakerPosition, orderIndex + 1);
      if (layout) {
        await this.speechBubbleRepo.save({
          frame_id: frame.id,
          text_content: p.captionVi,
          style_config: {},
          ...layout,
        });
      }
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
