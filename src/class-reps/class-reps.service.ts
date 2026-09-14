import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sendExpoPushNotification } from '../common/push-notification.helper';

@Injectable()
export class ClassRepsService {
  constructor(private readonly prisma: PrismaService) {}

  async assignClassRep(data: { studentId: string; courseId?: string; channel?: string }, creatorUser?: any) {
    let targetCourseId = data.courseId;
    if (!targetCourseId) {
      const student = await this.prisma.user.findUnique({ where: { id: data.studentId } });
      if (student?.schoolId) {
        const course = await this.prisma.course.findFirst({ where: { schoolId: student.schoolId } });
        targetCourseId = course?.id;
      }
      if (!targetCourseId) {
        const anyCourse = await this.prisma.course.findFirst();
        targetCourseId = anyCourse?.id;
      }
    }

    if (!targetCourseId) {
      throw new NotFoundException('No active course found in institution to assign class rep');
    }

    const course = await this.prisma.course.findUnique({ where: { id: targetCourseId } });
    if (!course) throw new NotFoundException('Course not found');

    const existing = await this.prisma.classRepAssignment.findFirst({
      where: { studentId: data.studentId, courseId: targetCourseId },
    });

    let assignment = existing;
    if (!assignment) {
      assignment = await this.prisma.classRepAssignment.create({
        data: {
          studentId: data.studentId,
          courseId: targetCourseId,
          channel: data.channel || 'Official Course Broadcast',
          active: true,
        },
        include: { course: true, student: true },
      });
    }

    let appointerName = 'your Department Lecturer';
    if (creatorUser?.fullName || creatorUser?.name) {
      appointerName = creatorUser.fullName || creatorUser.name;
    } else if (creatorUser?.id) {
      const u = await this.prisma.user.findUnique({
        where: { id: creatorUser.id },
        select: { fullName: true },
      });
      if (u?.fullName) appointerName = u.fullName;
    }

    // Trigger REAL Notification in DB
    const courseInfo = `${course.code} (${course.name})`;
    const notificationMsg = `You have been appointed as the Class Representative for ${courseInfo} by ${appointerName}.`;

    await this.prisma.notification.create({
      data: {
        userId: data.studentId,
        title: 'Class Rep Appointment',
        message: notificationMsg,
        type: 'class_rep',
        isRead: false,
      },
    });

    // Dispatch Push Notification via Expo
    const studentUser = await this.prisma.user.findUnique({
      where: { id: data.studentId },
      select: { pushToken: true },
    });

    if (studentUser?.pushToken) {
      sendExpoPushNotification(
        studentUser.pushToken,
        'Class Rep Appointment',
        notificationMsg,
        { type: 'class_rep', courseId: targetCourseId }
      );
    }

    return assignment;
  }

  async getMyStatus(studentId: string) {
    const assignments = await this.prisma.classRepAssignment.findMany({
      where: { studentId, active: true },
      include: { course: true },
    });

    return {
      isClassRep: assignments.length > 0,
      assignments,
    };
  }

  async findAll() {
    return this.prisma.classRepAssignment.findMany({
      where: { active: true },
      include: { course: true, student: { select: { id: true, fullName: true, email: true, school: true } } },
    });
  }

  async updateAssignment(id: string, data: any) {
    return this.prisma.classRepAssignment.update({ where: { id }, data });
  }

  async removeAssignment(id: string) {
    return this.prisma.classRepAssignment.delete({ where: { id } });
  }
}
