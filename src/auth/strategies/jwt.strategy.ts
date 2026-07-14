import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';

type JwtPayload = {
  sub: number | string;
  role: Role;
  jti: string;
  exp?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Dev fallback to keep local testing functional.
    // For production, always set `JWT_SECRET` in your environment.
    const secret = process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: Number(payload.sub),
      role: payload.role,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}

