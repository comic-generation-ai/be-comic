import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from 'src/common/config';

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  // Giá trị return được Nest gắn vào req.user — đọc bằng @CurrentUser()
  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
