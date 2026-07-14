import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard)
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Post('admin/assessments')
  create(@Body() data: any) {
    return this.assessmentsService.create(data);
  }

  @Get('courses/:courseId/assessments')
  findAllForCourse(@Param('courseId') courseId: string) {
    return this.assessmentsService.findAllForCourse(courseId);
  }

  @Post('assessments/:id/submit')
  submitAssessment(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.assessmentsService.submitAssessment(id, req.user.userId, data.fileUrl);
  }
}
