import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassRepsService {
  constructor(private readonly prisma: PrismaService) {}

  async assignClassRep(data: any) {
    return this.prisma.classRepAssignment.create({ data });
  }

  async findAll() {
    return this.prisma.classRepAssignment.findMany({
      include: { course: true, student: { select: { id: true, fullName: true, email: true } } },
    });
  }

  async updateAssignment(id: string, data: any) {
    return this.prisma.classRepAssignment.update({ where: { id }, data });
  }
}
