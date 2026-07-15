import { IsOptional, IsString, MaxLength } from 'class-validator';

// Dùng cho PATCH /users/me — chỉ các field user tự sửa được.
// Không có email/password/credits ở đây: đổi email cần xác thực lại,
// credits/subscription do hệ thống quản lý, không cho client tự set.
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
