import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConfig } from 'src/common/config';

@Module({
  imports: [
    UsersModule, // exports UsersService (findByEmail/createUser)
    PassportModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      // @nestjs/jwt đòi kiểu literal hẹp (vd "1d") cho expiresIn, trong khi
      // giá trị đọc từ process.env luôn được TS suy ra là `string` — ép kiểu
      // ở đây vì giá trị thật sự hợp lệ lúc runtime (kiểm tra ở config.ts).
      signOptions: { expiresIn: jwtConfig.accessTokenExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}` },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // phòng khi module khác cần verify token thủ công
})
export class AuthModule {}
