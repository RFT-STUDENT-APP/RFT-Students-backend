import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('public/overview')
  getPublicOverviewMetrics(@Query('schoolId') schoolId?: string) {
    return this.analyticsService.getDashboardMetrics(schoolId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get('dashboard')
  getDashboardMetrics(@Request() req: any, @Query('schoolId') querySchoolId?: string) {
    const schoolId = req.user.role === Role.SCHOOL_ADMIN ? req.user.schoolId : (querySchoolId || req.user.schoolId);
    return this.analyticsService.getDashboardMetrics(schoolId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get('overview')
  getOverviewMetrics(@Request() req: any, @Query('schoolId') querySchoolId?: string) {
    const schoolId = req.user.role === Role.SCHOOL_ADMIN ? req.user.schoolId : (querySchoolId || req.user.schoolId);
    return this.analyticsService.getDashboardMetrics(schoolId);
  }
}
