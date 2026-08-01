import { Controller, Get, Body, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { ResponseCommon } from 'src/common/dto/response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * [story-p0-be-security-payment] Changed: removed public GET/PATCH/DELETE /users/:id and GET /users; only JWT-guarded /me endpoints remain.
   */
  @Get('me')
  findMe(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.findMe(user.userId);
  }

  /**
   * [story-p0-be-security-payment] Changed: PATCH /users/me stays guarded; removed unguarded PATCH /users/:id.
   */
  @Patch('me')
  updateMe(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateMe(user.userId, dto);
  }

  /**
   * [story-be-production-hardening] Changed: DELETE /users/me soft-deletes account for teammate FE (T-P2-02).
   */
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteMe(@CurrentUser() user: CurrentUserPayload) {
    await this.usersService.deleteMe(user.userId);
    return ResponseCommon.ok(null, 'DELETE_ACCOUNT_SUCCESS');
  }
}
