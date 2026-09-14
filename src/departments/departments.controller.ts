import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller(['admin/departments', 'departments'])
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get('public')
  getPublicDepartments(@Query('schoolId') schoolId?: string) {
    if (schoolId) {
      return this.departmentsService.findBySchool(schoolId);
    }
    return this.departmentsService.findAll();
  }

  @Get('public/:schoolId')
  findPublicBySchool(@Param('schoolId') schoolId: string) {
    return this.departmentsService.findBySchool(schoolId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Post()
  create(@Body() data: any) {
    return this.departmentsService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Post('batch')
  createBatch(@Body() body: { schoolId: string; departments: string[] }) {
    return this.departmentsService.createBatch(body.schoolId, body.departments);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get('school/:schoolId')
  findBySchool(@Param('schoolId') schoolId: string) {
    return this.departmentsService.findBySchool(schoolId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER, Role.STUDENT)
  @Get()
  findAll(@Request() req: any, @Query('schoolId') querySchoolId?: string) {
    const schoolId = req.user?.role === Role.SCHOOL_ADMIN ? req.user?.schoolId : querySchoolId;
    if (schoolId) {
      return this.departmentsService.findBySchool(schoolId);
    }
    return this.departmentsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.departmentsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.departmentsService.delete(id);
  }
}
