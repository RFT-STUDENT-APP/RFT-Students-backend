import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createUser(dto: { fullName: string; email: string; schoolId?: string; departmentId?: string; phoneNumber?: string; courseIds?: string[]; role?: Role }) {
    const { fullName, email, schoolId, departmentId, phoneNumber, courseIds, role } = dto;

    if (!fullName || !email) {
      throw new BadRequestException('Full name and email are required');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email address already exists');
    }

    // Generate temporary password
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const rolePrefix = dto.role === Role.SCHOOL_ADMIN ? 'Adm' : dto.role === Role.SUPER_ADMIN ? 'Sup' : 'Lec';
    const tempPassword = `${rolePrefix}#${randomSuffix}!`;

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Get school name if schoolId is provided
    let schoolName: string | undefined;
    if (schoolId) {
      const school = await this.prisma.school.findUnique({ where: { id: schoolId } });
      if (school) schoolName = school.name;
    }

    // Connect courses if provided
    let taughtCoursesData: any = undefined;
    if (courseIds && Array.isArray(courseIds) && courseIds.length > 0) {
      taughtCoursesData = {
        connect: courseIds.map((cId) => ({ id: cId })),
      };
    }

    // Create user in DB
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        fullName: fullName.trim(),
        passwordHash: hashedPassword,
        role: role || Role.LECTURER,
        status: 'ACTIVE',
        phoneNumber: phoneNumber?.trim(),
        schoolId: schoolId || null,
        departmentId: departmentId || null,
        taughtCourses: taughtCoursesData,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        status: true,
        school: { select: { id: true, name: true, acronym: true } },
        department: { select: { id: true, name: true } },
        taughtCourses: { select: { id: true, code: true, name: true } },
        createdAt: true,
      },
    });

    // Send email with credentials via Resend
    await this.emailService.sendRoleCredentialsEmail(
      user.email,
      user.fullName,
      tempPassword,
      user.role,
      schoolName,
    );

    console.log(`\n======================================================`);
    console.log(`🔑 NEW ${user.role} ONBOARDED SUCCESSFULLY!`);
    console.log(`👤 Name: ${user.fullName}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Temporary Password: ${tempPassword}`);
    console.log(`======================================================\n`);

    return {
      message: 'Account created successfully. Credentials sent via email.',
      tempPassword,
      user,
    };
  }

  async updateLecturerCourses(id: string, courseIds: string[], customCourse?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const connectCourses: { id: string }[] = (courseIds || []).map((cId) => ({ id: cId }));

    if (customCourse && customCourse.trim()) {
      const customCode = customCourse.trim().toUpperCase().slice(0, 10);
      const customName = customCourse.trim();
      let deptId: string | null = null;
      let sId = user.schoolId;

      if (sId) {
        const dept = await this.prisma.department.findFirst({ where: { schoolId: sId } });
        if (dept) deptId = dept.id;
      }
      if (!deptId) {
        const anyDept = await this.prisma.department.findFirst();
        if (anyDept) {
          deptId = anyDept.id;
          sId = anyDept.schoolId;
        }
      }

      if (deptId && sId) {
        const newCourse = await this.prisma.course.create({
          data: {
            code: customCode,
            name: customName,
            schoolId: sId,
            departmentId: deptId,
            status: 'active',
          },
        });
        connectCourses.push({ id: newCourse.id });
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        taughtCourses: {
          set: connectCourses,
        },
      },
      select: {
        id: true,
        fullName: true,
        taughtCourses: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async updateUser(id: string, dto: { fullName?: string; email?: string; status?: string; schoolId?: string; courseIds?: string[] }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const data: any = {};
    if (dto.fullName) data.fullName = dto.fullName.trim();
    if (dto.email) data.email = dto.email.trim().toLowerCase();
    if (dto.status) data.status = dto.status;
    if (dto.schoolId !== undefined) data.schoolId = dto.schoolId || null;

    if (dto.courseIds && Array.isArray(dto.courseIds)) {
      data.taughtCourses = {
        set: dto.courseIds.map((cId) => ({ id: cId })),
      };
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        school: { select: { id: true, name: true, acronym: true } },
        taughtCourses: { select: { id: true, code: true, name: true } },
      },
    });
  }



  async findAll(query: { role?: Role; schoolId?: string; departmentId?: string; search?: string }) {
    const { role, schoolId, departmentId, search } = query;

    const where: any = {};
    if (role) where.role = role;
    if (departmentId) where.departmentId = departmentId;
    else if (schoolId) where.schoolId = schoolId;

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { matricNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    let users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        status: true,
        matricNumber: true,
        level: true,
        school: { select: { id: true, name: true, acronym: true } },
        department: { select: { id: true, name: true } },
        classRepAssignments: { select: { id: true, courseId: true, active: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0 && role === Role.STUDENT) {
      const fallbackWhere: any = { role: Role.STUDENT };
      if (schoolId) fallbackWhere.schoolId = schoolId;
      if (search) fallbackWhere.OR = where.OR;

      users = await this.prisma.user.findMany({
        where: fallbackWhere,
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          role: true,
          status: true,
          matricNumber: true,
          level: true,
          school: { select: { id: true, name: true, acronym: true } },
          department: { select: { id: true, name: true } },
          classRepAssignments: { select: { id: true, courseId: true, active: true } },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return users;
  }


  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        status: true,
        matricNumber: true,
        level: true,
        school: { select: { id: true, name: true, acronym: true } },
        department: { select: { id: true, name: true } },
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserStatus(id: string, status: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, status: true },
    });
  }

  async savePushToken(userId: string, pushToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { pushToken },
      select: { id: true, email: true, pushToken: true },
    });
  }

  async removeUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.delete({ where: { id } });
  }
}
