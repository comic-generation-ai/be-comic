# ComicSystem Backend (`be-comic`)

Ứng dụng Backend API được xây dựng bằng **NestJS** và **TypeORM**, đóng vai trò là API Gateway và lưu trữ dữ liệu chính cho hệ thống sinh truyện tranh tự động.

Mọi logic giao tiếp với các AI service (gRPC) và điều phối công việc đều được xử lý ở phía sau bởi `orchestrator-ai`. Client (Frontend) chỉ giao tiếp duy nhất với `be-comic`.

---

## 🛠️ Cài đặt & Khởi chạy (Local Development)

### Bước 1: Cài đặt Dependencies
```bash
npm install
```

### Bước 2: Thiết lập file môi trường `.env`
```bash
cp .env.example .env
```
Các biến quan trọng:

| Biến | Giá trị khuyên dùng | Ghi chú |
|---|---|---|
| `PORT` | `3000` | ⚠️ Default 8000 **đụng cổng** HTTP health của image-ai — đặt 3000 |
| `ORCHESTRATOR_URL` | `localhost:50054` | gRPC orchestrator-ai (không phải 50052 — đó là story-ai) |
| `DB_HOST` / `DB_PORT` | `localhost` / `5432` | Postgres container của dự án |
| `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE` | theo `.env.example` | |

### Bước 3: Khởi chạy Database Postgres qua Docker
```bash
docker compose up -d
```
> ⚠️ Máy có nhiều dự án: `docker ps` kiểm tra đúng container `be-comic-postgres`
> đang chạy (không nhầm với postgres của dự án khác chiếm cổng).

### Bước 4: Chạy Database Migration (TypeORM)
* Dựng database: `npm run migration:run`
* Sinh migration mới sau khi sửa Entity: `npm run migration:generate -- src/db/migrations/TenMigration`
* Rollback migration gần nhất: `npm run migration:revert`

### Bước 5: Seed dữ liệu tối thiểu (bắt buộc trước khi test)
`POST /generation-jobs` yêu cầu `projectId` tồn tại (FK). Tạo user + project mẫu:
```bash
docker exec -i be-comic-postgres psql -U admin -d comic_db <<'SQL'
INSERT INTO "COMIC_USER" (id, email, password_hash, subscription_tier, credits_balance)
VALUES ('11111111-1111-1111-1111-111111111111', 'dev@test.local', 'x', 'FREE', 100);

INSERT INTO "COMIC_PROJECT" (id, user_id, title, raw_prompt, status, credits_used)
VALUES (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
        'Truyện test', 'seed', 'DRAFT', 0)
RETURNING id;
SQL
```
> ⚠️ Dùng `gen_random_uuid()` — UUID "đẹp mắt" kiểu `2222...` sẽ bị ValidationPipe
> từ chối vì không đúng chuẩn RFC (sai version/variant nibble).

### Bước 6: Khởi chạy NestJS
```bash
npm run start:dev
```
Server chạy tại **`http://localhost:3000`**, prefix **`/api`** (ví dụ `POST /api/generation-jobs`).

---

## 🔌 Test API (Postman / Swagger)

Swagger UI có sẵn tại 👉 **http://localhost:3000/docs** (Try it out được).

### Chế độ 1 — Test "khô" (chỉ cần Postgres, KHÔNG cần dàn AI)
Dùng để test validation + ghi DB. Orchestrator tắt nên POST job sẽ trả
`500 "Active pipeline AI error"` — **đó là kết quả đúng** của chế độ này
(job đã ghi DB với status FAILED, kiểm bằng GET).

| Request | Kỳ vọng |
|---|---|
| `POST /api/generation-jobs` body chuẩn | 500 pipeline error (orchestrator tắt) |
| `GET /api/generation-jobs/{id}` | 200, `localJob.status = FAILED` |
| POST thiếu `summary` | 400 kèm message validate |
| POST `projectId` không phải UUID | 400 `projectId must be a UUID` |
| `GET /api/generation-jobs/{uuid-bừa}` | 404 |

### Chế độ 2 — Test luồng đầy đủ (cần dàn AI chạy)
Bật theo thứ tự: `image-ai` (docker redis+minio → celery worker → server) →
`story-ai` → `orchestrator-ai` → `be-comic`. Xem README từng repo.

1. `POST /api/generation-jobs`
   ```json
   {
     "projectId": "<uuid từ bước seed>",
     "summary": "Chú gấu con Nâu học làm bánh mì cùng bà ngoại trong căn bếp ấm áp.",
     "style": "storybook",
     "numPanels": 4
   }
   ```
   → `202 { jobId, status: "RUNNING" }`
2. `GET /api/generation-jobs/{jobId}` — poll mỗi 2-3s, xem `liveStatus.currentStep`
   chạy từ "Generating story" → "Generating panel 4/4". Trên Mac (model LCM)
   toàn trình ~3–5 phút; trên GPU cloud ~1–2 phút.
3. Khi COMPLETED: panels được chốt bền vào Postgres —
   `GET /api/frames?projectId=...` trả 4 frame (`image_url` là **MinIO object key**,
   xem ghi chú trong contract).
4. Hủy job đang chạy: `DELETE /api/generation-jobs/{jobId}`.

### Những điểm FE cần biết (chi tiết trong contract)
- `liveStatus.status` là **enum số** của orchestrator: 2=STORY_GENERATING,
  4=IMAGE_GENERATING, 6=SUCCESS, 7=FAILED, 8=CANCELLED.
- gRPC **lược bỏ giá trị 0**: panel đầu tiên không có field `index` (hiểu là 0),
  `progressCurrent` vắng mặt nghĩa là 0.
- `imageUrl` trong liveStatus là presigned URL hết hạn 7 ngày; `image_url` trong
  frames là object key (endpoint cấp URL mới sẽ bổ sung sau).
- Chưa có auth JWT (đang làm) — FE nên viết sẵn interceptor gắn Bearer token.

---

## 📖 OpenAPI Contract (Hợp đồng API)

Hợp đồng chính giữa FE và BE:
📄 **[public-api.openapi.yaml](../documents/contracts/public-api.openapi.yaml)** (v0.2.0 — đã đồng bộ theo code thực tế)

Cách xem: import vào [Swagger Editor](https://editor.swagger.io/) hoặc extension **OpenAPI (Swagger) Editor** của VS Code.

> **Nghi thức khi sửa contract gRPC** (`documents/contracts/*.proto`): sửa file gốc
> trong `documents/contracts/` → copy về từng service → regen:
> - `cp documents/contracts/orchestrator.proto be-comic/src/proto/` (Nest tự copy vào
>   `dist/` nhờ `assets` trong `nest-cli.json`)
> - image-ai / orchestrator-ai: cp + chạy `scripts/generate_proto.sh` của từng repo

---

## 📂 Cấu trúc thư mục chính

* `src/db/`: cấu hình `data-source.ts` và thư mục `migrations/`.
* `src/proto/`: contract gRPC (copy từ `documents/contracts/`, build tự đưa vào `dist/proto/`).
* `src/common/`: Base class, constants, interceptors, filters dùng chung.
* `src/module/`:
  * `users/`: tài khoản, credits.
  * `projects/`: dự án truyện của người dùng.
  * `scripts/`: kịch bản truyện sinh từ AI.
  * `frames/`: panel đã lưu bền (ảnh + caption + seed). Sinh tự động từ generation-jobs, API chỉ đọc.
  * `speech-bubbles/`: bong bóng thoại đè trên ảnh (FE render SVG — phase sau).
  * `generation-jobs/`: tiến trình tạo truyện, cầu nối gRPC sang orchestrator.
  * `transactions/`: lịch sử nạp/trừ credits.

## 🚧 TODO đã biết
- [ ] Auth JWT (`/api/auth/register|login|me`) + guard cho generation-jobs.
- [ ] Chuẩn hóa response GET job (phẳng hóa `{localJob, liveStatus}` — sẽ bump contract v0.3).
- [ ] Endpoint cấp presigned URL từ object key của frames.
- [ ] CRUD speech-bubbles cho FE.
