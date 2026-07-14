import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // Admin scopes
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Post('admin/courses')
  create(@Body() data: any) {
    return this.coursesService.create(data);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get('admin/courses')
  findAllAdmin() {
    return this.coursesService.findAllAdmin();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Patch('admin/courses/:id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.coursesService.update(id, data);
  }

  // Student scopes
  @Get('courses')
  findAllStudent() {
    return this.coursesService.findAllStudent();
  }

  @Get('courses/:id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }
}
