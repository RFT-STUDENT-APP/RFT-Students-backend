import { Controller, Get, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { ClassRepsService } from './class-reps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/class-reps')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassRepsController {
  constructor(private readonly classRepsService: ClassRepsService) {}

  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Post()
  assignClassRep(@Body() data: any) {
    return this.classRepsService.assignClassRep(data);
  }

  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Get()
  findAll() {
    return this.classRepsService.findAll();
  }

  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Put(':assignmentId')
  updateAssignment(@Param('assignmentId') assignmentId: string, @Body() data: any) {
    return this.classRepsService.updateAssignment(assignmentId, data);
  }
}
