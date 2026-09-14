import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type JwtPayload = {
  sub: number | string;
  role: Role;
  jti: string;
  exp?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const userId = String(payload.sub);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { schoolId: true, departmentId: true, status: true, school: { select: { status: true } } },
    });

    if (
      !user ||
      user.status === 'DEACTIVATED' ||
      user.status === 'SUSPENDED' ||
      user.school?.status === 'deleted' ||
      user.school?.status === 'deactivated'
    ) {
      throw new UnauthorizedException('Access revoked. Your user or institution account is deactivated or deleted.');
    }

    return {
      id: userId,
      userId: userId,
      sub: userId,
      role: payload.role,
      schoolId: user?.schoolId || null,
      departmentId: user?.departmentId || null,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}

