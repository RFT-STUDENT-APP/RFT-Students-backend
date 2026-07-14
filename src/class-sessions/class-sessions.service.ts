import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.classSession.create({ data });
  }

  async findAllForCourse(courseId: string) {
    return this.prisma.classSession.findMany({
      where: { courseId },
      orderBy: { startTime: 'asc' },
    });
  }
}
