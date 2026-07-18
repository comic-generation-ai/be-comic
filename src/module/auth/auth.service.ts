import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseCommon } from 'src/common/dto/response.dto';
import { IResponse } from 'src/common/Interfaces/respone.interface';
import { jwtConfig } from 'src/common/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto): Promise<IResponse<any>> {
    if (dto.password !== dto.confirmPassword) {
      return ResponseCommon.fail(400, 'PASSWORD_NOT_MATCH');
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      return ResponseCommon.fail(400, 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser(dto.email, passwordHash, dto.fullName);

    return ResponseCommon.created(
      { id: user.id, email: user.email, fullName: user.fullName },
      'CREATE_USER_SUCCESS',
    );
  }

  async login(dto: LoginDto): Promise<IResponse<any>> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      return ResponseCommon.fail(404, 'ACCOUNT_DOES_NOT_EXIST');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      return ResponseCommon.fail(400, 'WRONG_PASSWORD');
    }

    const token = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { secret: jwtConfig.secret, expiresIn: jwtConfig.accessTokenExpiresInLogin as any },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { secret: jwtConfig.refreshSecret, expiresIn: jwtConfig.accessTokenExpiresRefreshInLogin as any },
    );

    return ResponseCommon.ok(
      { email: user.email, token, refreshToken },
      'LOGIN_SUCCESS',
    );
  }

  async refreshAccessToken(userId: string, email: string): Promise<IResponse<any>> {
    const token = await this.jwtService.signAsync(
      { sub: userId, email },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { secret: jwtConfig.secret, expiresIn: jwtConfig.accessTokenExpiresInLogin as any },
    );
    return ResponseCommon.ok({ token }, 'REFRESH_TOKEN_SUCCESS');
  }
}
