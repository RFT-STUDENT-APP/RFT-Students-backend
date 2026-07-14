import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(userId: string | null, data: any) {
    // If anonymous is true, we force userId to null
    const finalUserId = data.isAnonymous ? null : userId;
    return this.prisma.feedback.create({
      data: { ...data, userId: finalUserId },
    });
  }

  async findAllFeedback() {
    return this.prisma.feedback.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
