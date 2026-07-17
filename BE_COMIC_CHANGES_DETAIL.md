# Báo cáo Chi tiết Sửa đổi và Mục đích Thay đổi trong `be-comic`

**Ngày báo cáo:** 17/07/2026  
**Phạm vi:** Toàn bộ các file đã được sửa đổi và xây dựng mới trong codebase `be-comic` (Backend NestJS).

Báo cáo này tổng hợp chi tiết **nội dung đã sửa đổi** và **mục đích cụ thể tại từng file** trong `be-comic`, bao gồm các thay đổi đang thực hiện (Working Tree / Uncommitted) cho tính năng **Tự động sinh bong bóng thoại (Auto-Generate Speech Bubbles)** và các module cốt lõi vừa được xây dựng gần đây.

---

## I. Nhóm File Sửa đổi cho Tính năng Tự động sinh Bong bóng thoại & Đồng bộ gRPC (Working Tree Changes)

Bối cảnh: Các microservices AI (`story-ai`, `orchestrator-ai`) đã được nâng cấp để trả về thêm thông tin `speaker` (nhân vật nói), `panel_type` (loại khung hình) và `speaker_position` (vị trí nói) cho từng panel truyện tranh. Đợt sửa đổi này giúp `be-comic` **tự động tính toán và tạo sẵn bong bóng thoại vào Database ngay khi lưu frame**, thay vì để trống chờ người dùng tạo thủ công.

### 1. `src/proto/orchestrator.proto`
- **Nội dung sửa đổi:** Bổ sung 3 trường mới vào `message PanelResult` (các field từ 8 đến 10):
  ```proto
  string speaker = 8;                // Tên nhân vật nói hoặc "Người kể chuyện"
  string panel_type = 9;             // Loại khung: action | dialogue | narration
  string speaker_position = 10;      // Vị trí nhân vật: left | center | right
  ```
- **Mục đích sửa đổi:** Đồng bộ hợp đồng dữ liệu gRPC (`gRPC Contract`) với `orchestrator-ai`. Nhờ đó, Backend NestJS có thể parse đầy đủ các siêu dữ liệu (metadata) mới từ AI trả về để biết chính xác câu thoại thuộc về nhân vật nào, ở vị trí nào trên tranh.

---

### 2. `src/module/generation-jobs/dto/panel.dto.ts`
- **Nội dung sửa đổi:** Thêm 3 thuộc tính tùy chọn (optional properties) vào `PanelDto` khớp với cấu trúc gRPC (đã được tự động map sang camelCase):
  ```ts
  speaker?: string;
  panelType?: string;       // ánh xạ từ panel_type
  speakerPosition?: string; // ánh xạ từ speaker_position
  ```
- **Mục đích sửa đổi:** Đảm bảo tính an toàn kiểu dữ liệu (Type-Safety) trong TypeScript khi nhận phản hồi từ service Orchestrator (`GetComicJobStatus`) và khi truyền dữ liệu panel sang `FramesService` để xử lý lưu vào cơ sở dữ liệu.

---

### 3. `src/module/frames/frames.module.ts`
- **Nội dung sửa đổi:** Import và đăng ký thêm entity `SpeechBubble` vào `TypeOrmModule.forFeature([Frame, SpeechBubble])`.
- **Mục đích sửa đổi:** Cung cấp quyền truy cập `Repository<SpeechBubble>` cho `FramesService`, cho phép `FramesService` có thể tiêm (inject) repository này để trực tiếp xóa/tạo bong bóng thoại trong cùng một giao dịch lưu frame truyện.

---

### 4. `src/module/frames/frames.service.ts`
- **Nội dung sửa đổi:**
  - **Cải tiến `saveFromPanels`:** Sau khi lưu/upsert `Frame`, hệ thống sẽ truy vấn lại ID frame và **xóa toàn bộ bong bóng thoại tự động cũ (`speechBubbleRepo.delete({ frame_id })`)** trước khi tạo mới. Điều này ngăn lỗi trùng lặp bong bóng khi job chạy lại hoặc regenerate. *(Lưu ý: Không dùng `upsert` trên bảng `COMIC_SPEECH_BUBBLE` vì bảng không có unique constraint trên `frame_id`).*
  - **Thêm hàm `classifyBubble(panel)`:** Phân loại bong bóng lời thoại thành:
    - `NONE`: Không có lời thoại (`captionVi` rỗng).
    - `NARRATION`: Lời dẫn truyện (`panel_type = 'narration'`, thiếu `speaker` hoặc `speaker = 'Người kể chuyện'`).
    - `SPEECH`: Lời thoại thông thường (`panel_type = 'dialogue'`).
    - `SHOUT`: Lời thoại hét/cảm xúc mạnh (`panel_type = 'action'`).
  - **Thêm hàm `computeBubbleLayout(...)`:** Tự động tính toán tọa độ `posX`, `posY`, kích thước (`width`, `height`) và hướng đuôi (`tailDirection`) chuẩn xác:
    - *Narration (Lời dẫn):* Đặt cố định ở đáy khung tranh, chiều rộng 85%, không có đuôi.
    - *Speech/Shout:* Đặt ở góc trên bên trái (`left`), giữa (`center`) hoặc bên phải (`right`) tùy theo `speaker_position` (nếu thiếu thông tin vị trí sẽ luân phiên trái/phải theo số thứ tự panel).
  - **Tạo mới bong bóng:** Gọi `speechBubbleRepo.save(...)` để lưu bong bóng thoại mới vào DB với nội dung `text_content = panel.captionVi`.
- **Mục đích sửa đổi:** Tự động hóa hoàn toàn việc sinh ra các bong bóng thoại có tọa độ, kích thước và thẩm mỹ hợp lý ngay sau khi AI sinh xong tranh. Người dùng khi mở trang chỉnh sửa sẽ thấy ngay truyện có sẵn lời thoại được bố trí gọn gàng.

---

### 5. `src/module/speech-bubbles/speech-bubbles.service.ts`
- **Nội dung sửa đổi:** Thay thế toàn bộ mã giả định (stub method sinh tự động từ NestJS CLI trả về string `'This action adds a new speechBubble...'`) bằng nghiệp vụ CRUD thực tế kết nối với PostgreSQL qua `@InjectRepository(SpeechBubble)`:
  - `create(dto)`: Chuyển đổi DTO từ camelCase sang các cột entity snake_case và lưu vào DB.
  - `findAll()` & `findOne(id)`: Truy vấn danh sách và chi tiết bong bóng thoại, tự động throw `NotFoundException` nếu UUID không tồn tại.
  - `update(id, dto)`: Cập nhật từng phần (partial update) cho tọa độ, kích thước, nội dung, kiểu bong bóng hoặc cấu hình style (`styleConfig`).
  - `remove(id)`: Xóa bong bóng thoại khỏi cơ sở dữ liệu.
- **Mục đích sửa đổi:** Cung cấp logic nghiệp vụ hoàn chỉnh cho tính năng thao tác bong bóng thoại (thêm, sửa, xóa, di chuyển, kéo giãn trên canvas phía Frontend).

---

### 6. `src/module/speech-bubbles/speech-bubbles.controller.ts`
- **Nội dung sửa đổi:** Sửa lại các phương thức `findOne`, `update`, và `remove`: Loại bỏ toán tử chuyển đổi kiểu số `+id` thành `id: string`.
- **Mục đích sửa đổi:** Khắc phục lỗi `NaN` nghiêm trọng. Khóa chính `id` của entity `SpeechBubble` là chuỗi UUID (VD: `550e8400-e29b-41d4-a716-446655440000`). Nếu giữ toán tử `+id`, NestJS sẽ parse thành `NaN` khiến mọi API GET/PATCH/DELETE chi tiết theo ID đều bị thất bại.

---

### 7. `src/module/speech-bubbles/dto/create-speech-bubble.dto.ts`
- **Nội dung sửa đổi:** Điền đầy đủ định nghĩa thuộc tính cho DTO (trước đó là file rỗng `{}`), sử dụng các decorator của `class-validator`:
  ```ts
  @IsUUID() frameId: string;
  @IsString() @IsNotEmpty() textContent: string;
  @IsEnum(BubbleType) bubbleType: BubbleType;
  @IsNumber() posX: number;
  @IsNumber() posY: number;
  @IsNumber() width: number;
  @IsNumber() height: number;
  @IsOptional() tailDirection?: string;
  @IsOptional() styleConfig?: Record<string, any>;
  ```
- **Mục đích sửa đổi:** Kiểm tra tính hợp lệ của dữ liệu đầu vào (Input Validation) từ các request REST API, bảo đảm các trường bắt buộc và tọa độ kích thước phải đúng định dạng số/UUID trước khi chạm tới Controller và Service.

---

### 8. `docker-compose.yml`
- **Nội dung sửa đổi:** Cập nhật ánh xạ cổng (port mapping) của container PostgreSQL:
  ```yaml
  ports:
    - "${DB_PORT:-5432}:5432"
  ```
- **Mục đích sửa đổi:** Cho phép cấu hình linh hoạt cổng database thông qua biến môi trường `.env` (`DB_PORT`), thay vì fix cứng cổng 5432. Giúp tránh xung đột cổng khi trên máy nhà phát triển hoặc máy chủ deploy đã có sẵn một instance PostgreSQL khác đang chạy ở cổng 5432.

---

### 9. `.gitignore`
- **Nội dung sửa đổi:** Bổ sung các quy tắc bỏ qua tệp tin rác, tệp môi trường nhạy cảm (`.env*`), tệp build/dist, log chẩn đoán của Node.js (`report.*.json`), và các thư mục IDE/OS (`.DS_Store`, `.vscode/*`).
- **Mục đích sửa đổi:** Giữ cho kho lưu trữ Git luôn sạch sẽ, tránh commit nhầm các tệp tin hệ thống, cấu hình môi trường chứa mật khẩu hoặc file log rác lên GitHub.

---

## II. Nhóm File Sửa đổi/Xây dựng Gần đây cho Các Module Core (Recent Commits)

Ngoài cụm tính năng bong bóng thoại, dưới đây là chi tiết và mục đích của các file chính trong các module cốt lõi vừa được triển khai trong thời gian gần đây:

### 10. `src/module/projects/projects.controller.ts` & `projects.service.ts`
- **Nội dung sửa đổi:** Triển khai các API endpoint (`POST /projects`, `GET /projects`, `PATCH /projects/:id`, `DELETE /projects/:id`) có tích hợp bảo mật `@UseGuards(JwtAuthGuard)` và lọc theo `userId` của người dùng đang đăng nhập.
- **Mục đích sửa đổi:** Xây dựng hệ thống quản lý dự án truyện tranh (Projects), cho phép mỗi người dùng tạo và quản lý danh sách truyện tranh riêng biệt của mình một cách an toàn và bảo mật.

---

### 11. `src/module/generation-jobs/generation-jobs.controller.ts` & `generation-jobs.service.ts`
- **Nội dung sửa đổi:** Xây dựng API `POST /generation-jobs` (tiếp nhận yêu cầu tạo truyện từ Frontend, gửi sang Orchestrator qua gRPC) và `GET /generation-jobs/:jobId` (truy vấn tiến độ sinh tranh từ AI, tự động đồng bộ kết quả về DB qua `FramesService`).
- **Mục đích sửa đổi:** Đóng vai trò là cầu nối điều phối (Bridge) giữa Frontend và hệ thống AI Microservices (`Orchestrator`, `Story-AI`, `Image-AI`), giúp quản lý vòng đời của một quy trình sinh truyện tranh tự động.

---

### 12. `src/module/users/users.controller.ts`, `users.service.ts` & `entities/user.entity.ts`
- **Nội dung sửa đổi:** Hoàn thiện module Quản lý người dùng (Users) và cập nhật Entity `User` để mở rộng kiểu dữ liệu cho `avatarUrl` sang `TEXT` (đồng bộ qua migration `1784098300000-AlterAvatarUrlToText.ts`).
- **Mục đích sửa đổi:** Xử lý các thao tác quản lý hồ sơ cá nhân (UserProfile), lưu trữ thông tin tài khoản, và hỗ trợ lưu URL ảnh đại diện dài mà không bị lỗi giới hạn ký tự của database.

---

## Bảng Tổng hợp nhanh (Quick Summary Table)

| File | Module | Mục đích chính |
| :--- | :--- | :--- |
| `src/proto/orchestrator.proto` | gRPC / Proto | Đồng bộ contract gRPC thêm `speaker`, `panel_type`, `speaker_position`. |
| `generation-jobs/dto/panel.dto.ts` | Generation Jobs | Thêm kiểu dữ liệu cho các trường metadata mới của panel. |
| `frames/frames.module.ts` | Frames | Inject `Repository<SpeechBubble>` vào `FramesModule`. |
| `frames/frames.service.ts` | Frames | Viết lại `saveFromPanels`: xóa bubble cũ, phân loại và tự động sinh layout bong bóng thoại mới. |
| `speech-bubbles/speech-bubbles.service.ts` | Speech Bubbles | Triển khai logic CRUD thực tế với TypeORM thay thế code stub. |
| `speech-bubbles/speech-bubbles.controller.ts` | Speech Bubbles | Sửa lỗi `NaN` khi parse UUID (`id: string` thay vì `+id`). |
| `speech-bubbles/dto/create-speech-bubble.dto.ts` | Speech Bubbles | Thêm validation (`@IsUUID`, `@IsNumber`, `@IsEnum`) cho input bong bóng thoại. |
| `docker-compose.yml` | Config / Docker | Hỗ trợ cấu hình cổng DB qua biến môi trường `${DB_PORT:-5432}`. |
| `.gitignore` | Config / Git | Loại bỏ tệp rác, log chẩn đoán và file môi trường khỏi Git. |
| `projects/projects.*` | Projects | Quản lý dự án truyện tranh cá nhân có xác thực JWT. |
| `generation-jobs/generation-jobs.*` | Generation Jobs | Giao tiếp AI Orchestrator và quản lý tiến độ sinh truyện. |
| `users/users.*` & `entities/user.entity.ts` | Users | Quản lý người dùng, hồ sơ cá nhân và migration ảnh đại diện. |
