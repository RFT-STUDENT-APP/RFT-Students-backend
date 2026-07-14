import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, data: any) {
    return this.prisma.admissionRequest.create({
      data: { ...data, userId },
    });
  }

  async findAllPending() {
    return this.prisma.admissionRequest.findMany({
      where: { status: 'pending' },
      include: { user: { select: { fullName: true, email: true } }, school: true, department: true },
    });
  }

  async processRequest(id: string, status: string) {
    const request = await this.prisma.admissionRequest.update({
      where: { id },
      data: { status },
    });

    if (status === 'approved') {
      // Automatically assign the user to the school and department
      await this.prisma.user.update({
        where: { id: request.userId },
        data: { schoolId: request.schoolId, departmentId: request.departmentId },
      });
    }

    return request;
  }
}
