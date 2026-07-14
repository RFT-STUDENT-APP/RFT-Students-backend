import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any, authorId: string) {
    return this.prisma.announcement.create({
      data: { ...data, authorId },
    });
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      include: { author: { select: { fullName: true, role: true } }, course: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: { author: { select: { fullName: true, role: true } }, course: true },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }

  async update(id: string, data: any) {
    return this.prisma.announcement.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.announcement.delete({ where: { id } });
  }
}
