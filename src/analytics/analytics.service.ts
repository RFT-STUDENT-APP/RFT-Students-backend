import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(schoolId?: string) {
    const whereClause = schoolId ? { schoolId } : {};

    const [totalStudents, totalCourses, totalRevenue] = await Promise.all([
      this.prisma.user.count({ where: { ...whereClause, role: 'STUDENT' } }),
      this.prisma.course.count({ where: whereClause }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'success', user: whereClause },
      }),
    ]);

    return {
      totalStudents,
      totalCourses,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}
