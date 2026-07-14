import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;

    // bcrypt cắt input ở 72 byte — chặn sớm để tránh mật khẩu bị cắt âm thầm
    @IsString()
    @MinLength(6)
    @MaxLength(72)
    password: string;

    @IsString()
    @MinLength(6)
    @MaxLength(72)
    confirmPassword: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    fullName?: string;
}
