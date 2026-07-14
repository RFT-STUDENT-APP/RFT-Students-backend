import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  createTicket(@Body() data: any, @Request() req: any) {
    return this.supportService.createTicket(req.user.userId, data);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get('admin/tickets')
  findAllTickets() {
    return this.supportService.findAllTickets();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Patch('admin/tickets/:id/status')
  updateTicketStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.supportService.updateTicketStatus(id, status);
  }
}
