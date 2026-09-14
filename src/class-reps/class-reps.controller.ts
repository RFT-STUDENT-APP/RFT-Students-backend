import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ClassRepsService } from './class-reps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
export class ClassRepsController {
  constructor(private readonly classRepsService: ClassRepsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('class-reps/my-status')
  getMyStatus(@Req() req: any) {
    return this.classRepsService.getMyStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Post('admin/class-reps')
  assignClassRep(@Req() req: any, @Body() data: any) {
    return this.classRepsService.assignClassRep(data, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Get('admin/class-reps')
  findAll() {
    return this.classRepsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Put('admin/class-reps/:assignmentId')
  updateAssignment(@Param('assignmentId') assignmentId: string, @Body() data: any) {
    return this.classRepsService.updateAssignment(assignmentId, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Delete('admin/class-reps/:assignmentId')
  removeAssignment(@Param('assignmentId') assignmentId: string) {
    return this.classRepsService.removeAssignment(assignmentId);
  }
}
