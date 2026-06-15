# ComicSystem Backend (`be-comic`)

Ứng dụng Backend API được xây dựng bằng **NestJS** và **TypeORM**, đóng vai trò là API Gateway và lưu trữ dữ liệu chính cho hệ thống sinh truyện tranh tự động.

Mọi logic giao tiếp với các AI service (gRPC) và điều phối công việc (Saga Workflow) đều được xử lý ở phía sau bởi `orchestrator-ai`. Client (Frontend) chỉ giao tiếp duy nhất với `be-comic`.

---

## 🛠️ Cài đặt & Khởi chạy (Local Development)

### Bước 1: Cài đặt Dependencies
Cài đặt các gói thư viện cần thiết:
```bash
npm install
```

### Bước 2: Thiết lập file môi trường `.env`
Sao chép file cấu hình mẫu và điền thông tin kết nối cơ sở dữ liệu của bạn:
```bash
cp .env.example .env
```
*Mặc định file `.env` đã được cấu hình trỏ vào container Postgres chạy ở local.*

### Bước 3: Khởi chạy Database Postgres qua Docker
Khởi chạy container PostgreSQL được cấu hình sẵn cho dự án:
```bash
docker-compose up -d
```

### Bước 4: Chạy Database Migration (TypeORM)
Dự án sử dụng cơ chế **Migration** của TypeORM để quản lý cấu trúc bảng (schema).

* **Chạy toàn bộ migrations** để dựng database:
  ```bash
  npm run migration:run
  ```
* **Tự động sinh migration mới** khi bạn thay đổi các file Entity:
  ```bash
  npm run migration:generate -- src/db/migrations/TenMigrationCuaBan
  ```
* **Hủy bỏ (rollback) migration gần nhất**:
  ```bash
  npm run migration:revert
  ```

### Bước 5: Khởi chạy NestJS ở chế độ Watch Mode
Khởi chạy server NestJS để phát triển:
```bash
npm run start:dev
```
Server backend sẽ chạy tại: **`http://localhost:8000`** với prefix là **`/api/v1`**.

---

## 📖 Tài liệu API (Swagger UI & OpenAPI)

### 1. Swagger UI trực quan
Khi ứng dụng khởi chạy, tài liệu API chi tiết sẽ được tự động tích hợp tại:
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**

Tại đây, bạn có thể xem chi tiết các Endpoint, kiểu dữ liệu truyền lên/nhận về và trực tiếp chạy thử (Try it out) các API.

### 2. OpenAPI Contract (Hợp đồng API)
Hợp đồng API chính giữa Frontend và Backend được định nghĩa tập trung tại file:
📄 **[public-api.openapi.yaml](../documents/contracts/public-api.openapi.yaml)**

* **Vai trò:** Giúp đội ngũ phát triển Front-end và Back-end thống nhất trước thiết kế API mà không cần chờ code xong.
* **Cách xem file này:** Bạn có thể cài extension **OpenAPI (Swagger) Editor** trên VS Code, hoặc import file này vào [Swagger Editor](https://editor.swagger.io/) để xem giao diện trực quan.

---

## 📂 Cấu trúc thư mục chính

* `src/db/`: Chứa cấu hình kết nối `data-source.ts` và thư mục `migrations/`.
* `src/common/`: Chứa các Base class, cấu hình constants, interceptors, filters dùng chung.
* `src/module/`: Chứa các module nghiệp vụ:
  * `users/`: Quản lý tài khoản, credits.
  * `projects/`: Quản lý dự án truyện tranh của người dùng.
  * `scripts/`: Quản lý kịch bản truyện tranh (4 panels) sinh từ AI.
  * `frames/`: Quản lý các khung hình và ảnh của từng panel.
  * `speech-bubbles/`: Quản lý các bong bóng thoại trên ảnh.
  * `generation-jobs/`: Quản lý tiến trình/trạng thái tạo truyện.
  * `transactions/`: Quản lý lịch sử nạp/trừ tiền/credits.
