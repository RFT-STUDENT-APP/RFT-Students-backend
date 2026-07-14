import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.course.create({ data });
  }

  async findAllAdmin() {
    return this.prisma.course.findMany({
      include: { school: true, department: true },
    });
  }

  async findAllStudent() {
    return this.prisma.course.findMany({
      where: { status: 'active' },
      select: { id: true, code: true, name: true, unit: true, level: true, module: true },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { lecturers: { select: { id: true, fullName: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: string, data: any) {
    return this.prisma.course.update({ where: { id }, data });
  }
}
