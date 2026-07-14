import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.department.create({ data });
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: { _count: { select: { courses: true, users: true } } },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.department.update({ where: { id }, data });
  }
}
