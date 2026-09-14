import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { DepartmentsService } from '../departments/departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
export class SchoolsController {
  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  @Get('schools/public')
  findPublic() {
    return this.schoolsService.findAll();
  }

  @Get('schools/public/:schoolId/departments')
  findSchoolDepartments(@Param('schoolId') schoolId: string) {
    return this.departmentsService.findBySchool(schoolId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('admin/schools')
  create(@Body() data: any) {
    return this.schoolsService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get('admin/schools')
  findAll() {
    return this.schoolsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get('admin/schools/:id')
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch('admin/schools/:id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.schoolsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch('admin/schools/:id/status')
  async toggleStatus(@Param('id') id: string, @Body('status') status: string) {
    if (status === 'active') {
      return this.schoolsService.reactivate(id);
    } else {
      return this.schoolsService.deactivate(id);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('admin/schools/:id/deactivation')
  deactivate(@Param('id') id: string, @Body('reason') reason: string) {
    return this.schoolsService.deactivate(id, reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete('admin/schools/:id')
  softDelete(@Param('id') id: string) {
    return this.schoolsService.softDelete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Patch('admin/schools/:id/subscription')
  changeSubscription(@Param('id') id: string, @Body('planName') planName: string) {
    return this.schoolsService.changeSubscription(id, planName);
  }
}
