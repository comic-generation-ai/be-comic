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

// Bong bóng kích thước cố định trước đây không co giãn theo độ dài lời thoại —
// chữ dài bị .bubble-static-text { -webkit-line-clamp: 5; overflow: hidden }
// ở FE cắt/che mất khi bong bóng quá nhỏ. Ước lượng số dòng cần thiết ở cỡ chữ
// mặc định (fontSize 16px, lineHeight 1.2 — xem defaults trong comic-editor.service.ts
// của FE) để nới rộng width/height cho vừa nội dung, có chặn trần tránh bong bóng
// phình quá khổ khung tranh.
const AVG_CHAR_WIDTH_PX = 9;
const LINE_HEIGHT_PX = 20; // fontSize 16 * lineHeight 1.2 ≈ 19.2, làm tròn lên
const TEXT_PADDING_PX = 28; // padding hai bên cộng dồn (foreignObject inset 12px x2 + container padding)
const MAX_BUBBLE_WIDTH = 280;
const MAX_BUBBLE_HEIGHT = 200;

function sizeForText(text: string | undefined, base: { width: number; height: number }): { width: number; height: number } {
  const len = text?.trim().length ?? 0;
  if (len === 0) return base;

  const width = Math.min(MAX_BUBBLE_WIDTH, len > 40 ? base.width + Math.min(60, Math.floor((len - 40) / 2)) : base.width);

  const charsPerLine = Math.max(8, Math.floor((width - TEXT_PADDING_PX) / AVG_CHAR_WIDTH_PX));
  const estimatedLines = Math.max(1, Math.ceil(len / charsPerLine));
  const neededHeight = estimatedLines * LINE_HEIGHT_PX + TEXT_PADDING_PX;

  const height = Math.min(MAX_BUBBLE_HEIGHT, Math.max(base.height, neededHeight));

  return { width, height };
}

function computeBubbleLayout(
  classification: BubbleClassification,
  speakerPosition: string | undefined,
  panelNumber: number,
  text: string | undefined,
): BubbleLayout | null {
  if (classification === 'NONE') return null;

  if (classification === 'NARRATION') {
    const { width, height } = sizeForText(text, { width: 240, height: 60 });
    return {
      bubble_type: BubbleType.NARRATION,
      pos_x: 50,
      pos_y: 88,
      width,
      height,
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
    const { width, height } = sizeForText(text, { width: 160, height: 100 });
    return {
      bubble_type: BubbleType.SPEECH,
      pos_x: posX,
      pos_y: 20,
      width,
      height,
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
  } else if (validPosition === 'center') {
    // Story-ai đã xác định rõ nhân vật đang nói đứng giữa khung tranh (speaker_position
    // = 'center') — trước đây nhánh này bị gộp chung với fallback luân phiên trái/phải
    // bên dưới nên bong bóng lại trỏ sang một bên không có nhân vật nào. Đặt đúng giữa,
    // mũi tên chỉ thẳng xuống nhân vật.
    posX = 50;
    tailDirection = 'down';
  } else {
    // Chỉ còn lại: SHOUT không có speaker_position hợp lệ (dữ liệu cũ) — luân phiên
    // trái/phải theo panel_number như một phỏng đoán cuối cùng.
    posX = panelNumber % 2 === 0 ? 70 : 30;
    tailDirection = posX === 70 ? 'down-right' : 'down-left';
  }

  const base = { width: isShout ? 190 : 170, height: isShout ? 100 : 95 };
  const { width, height } = sizeForText(text, base);

  return {
    bubble_type: isShout ? BubbleType.SHOUT : BubbleType.SPEECH,
    pos_x: posX,
    pos_y: isShout ? 15 : 18,
    width,
    height,
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
      const layout = computeBubbleLayout(classification, p.speakerPosition, orderIndex + 1, p.captionVi);
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
