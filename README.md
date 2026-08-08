# be-comic — Backend API (Hướng dẫn tiếng Việt)

`be-comic` là backend chính của dự án ComicSystem (NestJS + TypeORM). Nó
đóng vai trò API gateway và lưu trữ dữ liệu chính. Frontend giao tiếp trực
tiếp với service này; mọi tác vụ AI (tạo truyện, tạo ảnh) được ủy quyền cho
`orchestrator-ai` qua gRPC.

Mục tiêu file này: hướng dẫn đầy đủ, dễ làm theo để người mới clone có thể
chạy dịch vụ cục bộ, kiểm thử nhanh và khắc phục lỗi thường gặp.

---

**Yêu cầu trước khi bắt đầu**

- Hệ điều hành: macOS / Linux / Windows (WSL)
- Node.js >= 18 (dùng `nvm` khuyến nghị)
- Python 3.10+ (chỉ cần cho các scripts/proto nếu bạn chạy toàn bộ monorepo)
- Docker & Docker Compose (để chạy Postgres, Redis, MinIO cho dev)

---

## 1. Cách chạy nhanh (Quickstart)

Từ thư mục gốc của repo:

```bash
cd be-comic
cp .env.example .env
# Mở .env và thiết lập: DB_PASSWORD, ORCHESTRATOR_URL, JWT_SECRET, v.v.
```

Khởi hạ tầng dev (Postgres, Redis, MinIO) bằng Docker Compose (từ repo root):

```bash
docker compose up -d postgres redis minio
```

Cài phụ thuộc và chạy dịch vụ (development):

```bash
npm install
npm run start:dev
```

Sau khi chạy, kiểm tra:

- Swagger UI: http://localhost:3000/docs
- Health: http://localhost:3000/health

---

## 2. Biến môi trường quan trọng

- `PORT` — cổng chạy dịch vụ (mặc định 3000)
- `ORCHESTRATOR_URL` — URL tới `orchestrator-ai` (ví dụ `http://localhost:50054`)
- Postgres: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- MinIO: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`
- JWT: `JWT_SECRET`, `JWT_REFRESH_SECRET` (bắt buộc khi chạy production)

Luôn giữ file `.env` cục bộ và KHÔNG commit vào git. Dùng `.env.example` làm
mẫu chia sẻ cho contributor.

---

## 3. Migrations, seed và DB

- Chạy migration lên DB: `npm run migration:run`
- Tạo migration mới (sau thay đổi entity):

```bash
npm run migration:generate -- src/db/migrations/YourMigrationName
```

- Nếu có script seed, xem thư mục `src/db/seeds` hoặc `scripts/` để biết chi tiết.

---

## 4. Chạy trong Docker (tùy chọn)

Project có thể chạy trong container — tham khảo `docker/` hoặc `docker-compose`
trong repo (nếu có). Khi chạy trong Docker, đảm bảo các biến môi trường và
secret (JWT, DB password, MinIO creds) được cấu hình qua Docker secrets hoặc
environment overrides.

---

## 5. Mối liên hệ với các service khác

- `story-ai` sinh nội dung panel-level (FastAPI).
- `image-ai` xử lý tạo ảnh (gRPC + Celery worker). `be-comic` giao việc qua
	`orchestrator-ai`.
- `orchestrator-ai` là trung gian: nhận yêu cầu từ `be-comic`, gọi `story-ai`,
	gửi task tới `image-ai`, rồi trả kết quả về `be-comic`.

Hãy chắc rằng `ORCHESTRATOR_URL` trỏ đúng tới orchestrator khi chạy.

---

## 6. Troubleshooting thường gặp

- Không kết nối được DB: kiểm tra `DB_HOST`, port, user/password và container
	Postgres có đang chạy không.
- Lỗi MinIO: kiểm tra `MINIO_*` giống nhau giữa `be-comic` và các dịch vụ
	khác (ví dụ `image-ai` upload frames).
- Nếu swagger không hiển thị, kiểm tra logs console để biết lỗi boot NestJS
	(migrations, kết nối DB, biến môi trường thiếu).

---

## 7. Đóng góp và phát triển

- Mỗi PR nên kèm migration nếu thay đổi DB schema.
- Viết unit/integration tests cho các endpoint mới.

---

Nếu cần, tôi có thể cập nhật thêm phần `API reference` (danh sách endpoint)
theo spec hiện có hoặc thêm hướng dẫn chạy toàn bộ hệ thống (start tất cả
services cùng lúc) — bạn muốn tôi làm tiếp phần nào không?
