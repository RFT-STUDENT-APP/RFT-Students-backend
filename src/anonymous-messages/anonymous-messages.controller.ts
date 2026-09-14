import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AnonymousMessagesService } from './anonymous-messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller(['anonymous-messages', 'admin/anonymous-messages'])
export class AnonymousMessagesController {
  constructor(private readonly service: AnonymousMessagesService) {}

  @Post()
  create(@Body() dto: { message: string; schoolId?: string }) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get()
  findAll(@Request() req: any, @Query('schoolId') querySchoolId?: string, @Query('isRead') isRead?: string) {
    const schoolId = req.user.role === Role.SCHOOL_ADMIN ? req.user.schoolId : querySchoolId;
    return this.service.findAll({
      schoolId,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
