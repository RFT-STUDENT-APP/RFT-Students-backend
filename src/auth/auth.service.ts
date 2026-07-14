import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

type JwtAuthUser = {
  userId: string;
  role: Role;
  jti: string;
  exp?: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private getSaltRounds(): number {
    const raw = process.env.BCRYPT_SALT_ROUNDS;
    const parsed = raw ? Number(raw) : 10;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.getSaltRounds());
  }

  private async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  private signAccessToken(userId: string, role: Role): Promise<{ accessToken: string; jti: string }> {
    const jti = crypto.randomUUID();
    return this.jwt.signAsync({ sub: userId, role, jti }).then((accessToken) => ({ accessToken, jti }));
  }

  private toUserResponse(user: any) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phoneNumber,
      role: user.role,
      matricNo: user.matricNumber,
      school: user.school ? { id: user.school.id, name: user.school.name } : null,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private otpTtlMinutes(): number {
    const raw = process.env.OTP_TTL_MINUTES;
    const parsed = raw ? Number(raw) : 10;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  }

  private async createAndSendOtp(userId: string, purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD') {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(otp, this.getSaltRounds());
    const expiresAt = new Date(Date.now() + this.otpTtlMinutes() * 60_000);

    await this.prisma.otp.create({
      data: {
        userId,
        purpose: purpose as any,
        codeHash,
        expiresAt,
      },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.emailService.sendOtpEmail(user.email, otp, purpose);
    }
  }

  private async consumeOtp(userId: string, purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD', otp: string) {
    const candidates = await this.prisma.otp.findMany({
      where: { userId, purpose: purpose as any, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const c of candidates) {
      const ok = await bcrypt.compare(otp, c.codeHash);
      if (ok) {
        await this.prisma.otp.update({ where: { id: c.id }, data: { consumedAt: new Date() } });
        return true;
      }
    }
    return false;
  }

  async registerStudent(dto: any) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Email already in use');

    if (dto.matricNo) {
        const matricExisting = await this.prisma.user.findUnique({
        where: { matricNumber: dto.matricNo },
        select: { id: true },
        });
        if (matricExisting) throw new ConflictException('Matric number already in use');
    }

    const passwordHash = await this.hashPassword(dto.password);

    let schoolId: string | null = null;
    if (dto.schoolId) {
      const school = await this.prisma.school.findUnique({ where: { id: dto.schoolId } });
      if (!school) throw new UnauthorizedException('School not found');
      schoolId = school.id;
    }

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName || dto.firstName + ' ' + dto.lastName,
        email: dto.email,
        phoneNumber: dto.phone,
        passwordHash,
        role: Role.STUDENT,
        matricNumber: dto.matricNo,
        schoolId,
      },
      include: { school: true },
    });

    await this.createAndSendOtp(user.id, 'VERIFY_EMAIL');
    await this.emailService.sendWelcomeEmail(user.email, user.fullName);
    return { message: 'Registration successful. Verify OTP sent to email.' };
  }

  async login(dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { school: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    // if (!user.emailVerifiedAt) throw new UnauthorizedException('Email not verified'); // Removing strict verify for dev

    const ok = await this.verifyPassword(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const { accessToken } = await this.signAccessToken(user.id, user.role);
    return { accessToken, user: this.toUserResponse(user) };
  }

  async me(authUser: JwtAuthUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { school: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return this.toUserResponse(user);
  }

  async logout(authUser: JwtAuthUser) {
    const exp = authUser.exp ? new Date(authUser.exp * 1000) : new Date(Date.now() + 60 * 60_000);
    await this.prisma.revokedToken.create({
      data: {
        jti: authUser.jti,
        userId: authUser.userId,
        expiresAt: exp,
      },
    });
    return { message: 'Logged out' };
  }
}
