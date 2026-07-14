import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ClassSessionsService } from './class-sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard)
export class ClassSessionsController {
  constructor(private readonly classSessionsService: ClassSessionsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Post('admin/class-sessions')
  create(@Body() data: any) {
    return this.classSessionsService.create(data);
  }

  @Get('courses/:courseId/class-sessions')
  findAllForCourse(@Param('courseId') courseId: string) {
    return this.classSessionsService.findAllForCourse(courseId);
  }
}
