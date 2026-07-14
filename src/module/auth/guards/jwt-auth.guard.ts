import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Dùng: @UseGuards(JwtAuthGuard) trên controller/route cần đăng nhập
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
