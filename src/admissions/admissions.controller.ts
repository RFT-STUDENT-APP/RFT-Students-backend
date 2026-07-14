import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admissions')
@UseGuards(JwtAuthGuard)
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post('apply')
  apply(@Body() data: any, @Request() req: any) {
    return this.admissionsService.apply(req.user.userId, data);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get('admin/pending')
  findAllPending() {
    return this.admissionsService.findAllPending();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Patch('admin/:id/process')
  processRequest(@Param('id') id: string, @Body('status') status: string) {
    return this.admissionsService.processRequest(id, status);
  }
}
