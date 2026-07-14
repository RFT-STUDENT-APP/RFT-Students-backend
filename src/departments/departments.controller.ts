import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Post()
  create(@Body() data: any) {
    return this.departmentsService.create(data);
  }

  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.departmentsService.update(id, data);
  }
}
