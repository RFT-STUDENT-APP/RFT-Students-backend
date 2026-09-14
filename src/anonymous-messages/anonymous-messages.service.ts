import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnonymousMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: { message: string; schoolId?: string }) {
    if (!dto.message || !dto.message.trim()) {
      throw new Error('Message content is required');
    }
    
    let resolvedSchoolId: string | null = null;
    if (dto.schoolId) {
      // Check if it's a UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.schoolId);
      if (isUuid) {
        resolvedSchoolId = dto.schoolId;
      } else {
        // Try finding school by name if frontend passed a name instead of ID
        const school = await this.prisma.school.findFirst({
          where: { name: { equals: dto.schoolId, mode: 'insensitive' } }
        });
        if (school) resolvedSchoolId = school.id;
      }
    }

    return this.prisma.anonymousMessage.create({
      data: {
        message: dto.message.trim(),
        schoolId: resolvedSchoolId,
      },
      include: {
        school: { select: { id: true, name: true, acronym: true } },
      },
    });
  }

  async findAll(query: { schoolId?: string; isRead?: boolean }) {
    const where: any = {};
    if (query.schoolId) where.schoolId = query.schoolId;
    if (query.isRead !== undefined) where.isRead = query.isRead;

    return this.prisma.anonymousMessage.findMany({
      where,
      include: {
        school: { select: { id: true, name: true, acronym: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    const msg = await this.prisma.anonymousMessage.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('Message not found');
    return this.prisma.anonymousMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async remove(id: string) {
    const msg = await this.prisma.anonymousMessage.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('Message not found');
    return this.prisma.anonymousMessage.delete({ where: { id } });
  }
}
