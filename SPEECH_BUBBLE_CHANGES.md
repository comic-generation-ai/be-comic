# Thay đổi be-comic: tự động sinh bong bóng thoại theo panel

Ngày: 2026-07-17

Bối cảnh: `story-ai`/`orchestrator-ai` giờ trả về thêm `speaker`, `panel_type`,
`speaker_position` cho mỗi panel (xem
`documents/daily_tasks/SPEECH_BUBBLE_INTEGRATION_PLAN.md`). Các thay đổi dưới
đây làm cho be-comic **tự tạo sẵn bong bóng thoại** trong DB ngay khi lưu
frame xong, thay vì để trống chờ user tự thêm tay.

## 1. `src/proto/orchestrator.proto`

Thêm 3 field mới vào `message PanelResult` (field 8-10):

```proto
string speaker = 8;                // tên nhân vật nói, hoặc "Người kể chuyện"
string panel_type = 9;             // action | dialogue | narration
string speaker_position = 10;      // left | center | right
```

Đồng bộ tay với `orchestrator-ai/proto/orchestrator.proto` và
`documents/contracts/orchestrator.proto`. be-comic dùng `@grpc/proto-loader`
nạp `.proto` lúc runtime (không có bước codegen) nên chỉ cần sửa file này.

## 2. `src/module/generation-jobs/dto/panel.dto.ts`

Thêm 3 field optional khớp với `PanelResult` mới (đã tự động camelCase qua
gRPC client):

```ts
speaker?: string;
panelType?: string;      // panel_type
speakerPosition?: string; // speaker_position
```

`PanelDto` dùng chung để type cả response `GetComicJobStatus` (field
`panels`) lẫn tham số của `FramesService.saveFromPanels`.

## 3. `src/module/frames/frames.module.ts`

Import thêm `SpeechBubble` vào `TypeOrmModule.forFeature([...])` để
`FramesService` có thể inject `Repository<SpeechBubble>`.

## 4. `src/module/frames/frames.service.ts`

Viết lại `saveFromPanels`:

- Sau khi `upsert` `Frame` như cũ, `findOne` lại frame vừa lưu để lấy `id`.
- **Xoá bong bóng auto-generate cũ** của frame đó (`speechBubbleRepo.delete({ frame_id })`)
  trước khi tạo mới — tránh chồng bong bóng khi job chạy lại/regenerate.
  **Không dùng `upsert` theo `frame_id`** vì bảng `COMIC_SPEECH_BUBBLE` không
  có unique constraint trên cột này — `upsert` sẽ crash với lỗi Postgres
  `there is no unique or exclusion constraint matching the ON CONFLICT specification`.
- Thêm 2 hàm thuần (pure function) mới trong file:
  - `classifyBubble(panel)`: phân loại `NONE` (không có dialogue) /
    `NARRATION` (panel_type=narration hoặc thiếu speaker hoặc speaker =
    "Người kể chuyện") / `SPEECH` / `SHOUT` (panel_type=action).
  - `computeBubbleLayout(classification, speakerPosition, panelNumber)`:
    tính `pos_x/pos_y/width/height/tail_direction` theo bảng vị trí trong
    plan (narration đặt đáy khung không đuôi; speech/shout đặt theo
    `speaker_position` trái/phải/giữa, luân phiên theo panel_number nếu
    thiếu dữ liệu vị trí).
- Nếu có layout hợp lệ, `speechBubbleRepo.save(...)` (insert mới) với
  `text_content = p.captionVi`.

## 5. `src/module/speech-bubbles/speech-bubbles.service.ts`

Thay toàn bộ code stub NestJS CLI (`return 'This action...'`) bằng CRUD thật
dùng `@InjectRepository(SpeechBubble)`:

- `create()`: map DTO camelCase → entity snake_case, `save()`.
- `findAll()` / `findOne(id)`: query qua `Repository`, `findOne` throw
  `NotFoundException` nếu không có.
- `update(id, dto)`: chỉ gán field nào có mặt trong DTO, `save()` lại.
- `remove(id)`: xoá bản ghi, trả về bản ghi vừa xoá.

## 6. `src/module/speech-bubbles/speech-bubbles.controller.ts`

Sửa `findOne`/`update`/`remove`: bỏ `+id` (parse số) vì `id` của
`SpeechBubble` là UUID string, không phải số — code cũ sẽ luôn nhận `NaN`.

## 7. `src/module/speech-bubbles/dto/create-speech-bubble.dto.ts`

Điền đầy đủ field còn thiếu (trước đây file rỗng `{}`), dùng
`class-validator` cùng pattern với các DTO khác trong repo:

```ts
frameId: string;        // @IsUUID()
textContent: string;    // @IsString() @IsNotEmpty()
bubbleType: BubbleType;  // @IsEnum(BubbleType)
posX: number; posY: number; width: number; height: number; // @IsNumber()
tailDirection?: string;  // optional
styleConfig?: Record<string, any>; // optional
```

`UpdateSpeechBubbleDto` giữ nguyên (`PartialType(CreateSpeechBubbleDto)`),
tự động kế thừa các field trên ở dạng optional.

---

## Đã verify

- `npx tsc --noEmit -p tsconfig.json` chạy sạch, không lỗi biên dịch.
- Đối chiếu `documents/scripts/check-contracts-sync.sh`: `orchestrator.proto`
  đồng bộ OK giữa be-comic / orchestrator-ai / documents/contracts.

## Chưa verify (cần làm tiếp)

- Chưa chạy thử end-to-end thật: chưa rebuild/restart container be-comic,
  chưa bấm sinh 1 truyện thật để xác nhận `GET /frames?projectId=` trả về
  `speech_bubbles[]` có dữ liệu đúng như kỳ vọng.
