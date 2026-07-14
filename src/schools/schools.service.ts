import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.school.create({ data });
  }

  async findAll() {
    return this.prisma.school.findMany({
      include: { _count: { select: { faculties: true, departments: true, users: true, courses: true } } },
    });
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: { faculties: true, departments: true, _count: { select: { users: true, courses: true } } },
    });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  async update(id: string, data: any) {
    return this.prisma.school.update({ where: { id }, data });
  }

  async deactivate(id: string, reason: string) {
    return this.prisma.school.update({
      where: { id },
      data: { status: 'deactivated' },
    });
  }
}
