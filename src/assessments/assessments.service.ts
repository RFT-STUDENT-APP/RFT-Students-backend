import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssessmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.assessment.create({ data });
  }

  async findAllForCourse(courseId: string) {
    return this.prisma.assessment.findMany({
      where: { courseId },
      include: { _count: { select: { submissions: true } } },
    });
  }

  async submitAssessment(assessmentId: string, userId: string, fileUrl: string) {
    return this.prisma.assessmentSubmission.create({
      data: { assessmentId, userId, fileUrl },
    });
  }
}
