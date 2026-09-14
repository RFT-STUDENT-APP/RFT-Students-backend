import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class SchoolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService
  ) {}

  async create(data: any) {
    if (data.name) {
      const existing = await this.prisma.school.findUnique({
        where: { name: data.name }
      });
      if (existing) {
        throw new ConflictException('University already exists');
      }
    }
    try {
      return await this.prisma.school.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('University already exists');
      }
      throw error;
    }
  }

  async findAll() {
    const [schools, studentCounts, lecturerCounts] = await Promise.all([
      this.prisma.school.findMany({
        where: { status: { not: 'deleted' } },
        include: {
          subscriptions: { where: { status: 'active' }, orderBy: { createdAt: 'desc' } },
          _count: { select: { faculties: true, departments: true, users: true, courses: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.groupBy({
        by: ['schoolId'],
        where: { role: 'STUDENT', schoolId: { not: null } },
        _count: { _all: true },
      }),
      this.prisma.user.groupBy({
        by: ['schoolId'],
        where: { role: 'LECTURER', schoolId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const studentMap = new Map(studentCounts.map((s) => [s.schoolId, s._count._all]));
    const lecturerMap = new Map(lecturerCounts.map((l) => [l.schoolId, l._count._all]));

    const allPlans = await this.subscriptionsService.findAll();

    return schools.map((school) => {
      const activeSub = school.subscriptions?.[0];
      const planName = activeSub?.planName || (school.capacity && school.capacity > 10 ? 'Premium Plan' : 'Free Plan');
      
      const foundPlan = allPlans.find(p => p.id === planName || p.name === planName);
      let maxStudents = school.capacity || 10;
      if (foundPlan && foundPlan.maxStudents !== undefined) {
        maxStudents = foundPlan.maxStudents;
      } else {
        const lowerPlan = planName.toLowerCase();
        if (lowerPlan.includes('premium')) maxStudents = 5000;
        else if (lowerPlan.includes('enterprise')) maxStudents = 100000;
      }

      return {
        ...school,
        plan: foundPlan?.name || planName,
        maxStudents,
        studentCount: studentMap.get(school.id) || 0,
        lecturerCount: lecturerMap.get(school.id) || 0,
      };
    });
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findFirst({
      where: { id, status: { not: 'deleted' } },
      include: {
        subscriptions: { where: { status: 'active' }, orderBy: { createdAt: 'desc' } },
        faculties: true,
        departments: true,
        _count: { select: { users: true, courses: true } },
      },
    });
    if (!school) throw new NotFoundException('School not found or deleted');

    const [studentCount, lecturerCount] = await Promise.all([
      this.prisma.user.count({ where: { schoolId: id, role: 'STUDENT' } }),
      this.prisma.user.count({ where: { schoolId: id, role: 'LECTURER' } }),
    ]);

    const activeSub = school.subscriptions?.[0];
    const planName = activeSub?.planName || (school.capacity && school.capacity > 10 ? 'Premium Plan' : 'Free Plan');
    
    const allPlans = await this.subscriptionsService.findAll();
    const foundPlan = allPlans.find(p => p.name === planName);
    let maxStudents = school.capacity || 10;
    if (foundPlan && foundPlan.maxStudents !== undefined) {
      maxStudents = foundPlan.maxStudents;
    } else {
      const lowerPlan = planName.toLowerCase();
      if (lowerPlan.includes('premium')) maxStudents = 5000;
      else if (lowerPlan.includes('enterprise')) maxStudents = 100000;
    }

    return {
      ...school,
      plan: foundPlan?.name || planName,
      maxStudents,
      studentCount,
      lecturerCount,
    };
  }

  async update(id: string, data: any) {
    return this.prisma.school.update({ where: { id }, data });
  }

  async deactivate(id: string, reason?: string) {
    await this.prisma.user.updateMany({
      where: { schoolId: id },
      data: { status: 'DEACTIVATED' },
    });

    return this.prisma.school.update({
      where: { id },
      data: { status: 'deactivated' },
    });
  }

  async reactivate(id: string) {
    await this.prisma.user.updateMany({
      where: { schoolId: id, status: 'DEACTIVATED' },
      data: { status: 'ACTIVE' },
    });

    return this.prisma.school.update({
      where: { id },
      data: { status: 'active' },
    });
  }

  async softDelete(id: string) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) throw new NotFoundException('School not found');

    await this.prisma.user.updateMany({
      where: { schoolId: id },
      data: { status: 'DEACTIVATED' },
    });

    return this.prisma.school.update({
      where: { id },
      data: { status: 'deleted' },
    });
  }

  async changeSubscription(id: string, planName: string) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) throw new NotFoundException('School not found');

    const lowerPlan = (planName || 'Free Plan').toLowerCase();
    let capacity = 10;
    let price = 0;

    if (lowerPlan.includes('premium')) {
      capacity = 5000;
      price = 499000;
    } else if (lowerPlan.includes('enterprise')) {
      capacity = 100000;
      price = 1499000;
    }

    // Cancel old active subscriptions for this school
    await this.prisma.subscription.updateMany({
      where: { schoolId: id, status: 'active' },
      data: { status: 'cancelled' },
    });

    // Create new active subscription
    await this.prisma.subscription.create({
      data: {
        schoolId: id,
        planName,
        price,
        status: 'active',
      },
    });

    // Update school capacity in database
    await this.prisma.school.update({
      where: { id },
      data: { capacity },
    });

    return this.findOne(id);
  }
}
