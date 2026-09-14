import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseMessages(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const messages = await this.prisma.chatMessage.findMany({
      where: { courseId },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((msg) => {
      if (msg.isAnonymous) {
        return {
          ...msg,
          sender: {
            id: 'anonymous',
            fullName: 'Anonymous Student',
            email: '',
            role: 'STUDENT',
          },
        };
      }
      return msg;
    });
  }

  async sendMessage(courseId: string, userId: string, dto: { message: string; isAnonymous?: boolean }) {
    if (!dto.message || !dto.message.trim()) {
      throw new BadRequestException('Message body cannot be empty');
    }

    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const created = await this.prisma.chatMessage.create({
      data: {
        courseId,
        senderId: userId,
        message: dto.message.trim(),
        isAnonymous: Boolean(dto.isAnonymous),
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (created.isAnonymous) {
      return {
        ...created,
        sender: {
          id: 'anonymous',
          fullName: 'Anonymous Student',
          email: '',
          role: 'STUDENT',
        },
      };
    }

    return created;
  }
}
