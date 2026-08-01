import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser, type CurrentUserPayload } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

/**
 * [story-be-production-hardening] Changed: ThrottlerGuard on auth routes; @Public on register/login/refresh.
 */
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@CurrentUser() user: CurrentUserPayload) {
    return await this.authService.refreshAccessToken(user.userId, user.email);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@CurrentUser() user: CurrentUserPayload) {
    return user;
  }

  /**
   * [story-be-production-hardening] Changed: PATCH change-password for teammate FE (T-P2-01).
   */
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user.userId, dto);
  }
}
