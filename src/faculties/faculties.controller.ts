import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  // POST /admin/faculties
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Post('admin/faculties')
  create(@Body() data: any) {
    return this.facultiesService.create(data);
  }

  // GET /admin/schools/:schoolId/faculties
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get('admin/schools/:schoolId/faculties')
  findAllBySchool(@Param('schoolId') schoolId: string) {
    return this.facultiesService.findAllBySchool(schoolId);
  }

  // PATCH /admin/faculties/:id
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Patch('admin/faculties/:id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.facultiesService.update(id, data);
  }

  // POST /admin/faculties/:id/deactivate
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Post('admin/faculties/:id/deactivate')
  deactivate(@Param('id') id: string, @Body('reason') reason: string) {
    return this.facultiesService.deactivate(id, reason);
  }
}
