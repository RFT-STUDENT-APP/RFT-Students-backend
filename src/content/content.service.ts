import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.content.create({ data });
  }

  async findAll() {
    return this.prisma.content.findMany({
      include: { course: true, school: true },
    });
  }

  async findOne(id: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
    });
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async remove(id: string) {
    return this.prisma.content.delete({ where: { id } });
  }
}
