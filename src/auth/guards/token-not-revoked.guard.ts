import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TokenNotRevokedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { jti?: string } | undefined;
    const jti = user?.jti;
    if (!jti) return false;

    const revoked = await this.prisma.revokedToken.findUnique({
      where: { jti },
      select: { id: true },
    });
    return !revoked;
  }
}

