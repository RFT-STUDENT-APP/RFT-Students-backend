import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Roles(Role.SUPER_ADMIN)
  @Post()
  create(@Body() data: any) {
    return this.schoolsService.create(data);
  }

  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get()
  findAll() {
    return this.schoolsService.findAll();
  }

  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.schoolsService.update(id, data);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post(':id/deactivation')
  deactivate(@Param('id') id: string, @Body('reason') reason: string) {
    return this.schoolsService.deactivate(id, reason);
  }
}
