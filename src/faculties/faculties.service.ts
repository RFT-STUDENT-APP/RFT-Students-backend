import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacultiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.faculty.create({ data });
  }

  async findAllBySchool(schoolId: string) {
    return this.prisma.faculty.findMany({
      where: { schoolId },
      include: { departments: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.faculty.update({ where: { id }, data });
  }

  async deactivate(id: string, reason: string) {
    return this.prisma.faculty.update({
      where: { id },
      data: { status: 'deactivated' },
    });
  }
}
