import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SubscriptionsService, PlanDto } from './subscriptions.service';
import { PaymentsService } from '../payments/payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Req } from '@nestjs/common';

@Controller('admin/subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly paymentsService: PaymentsService
  ) {}

  @Get()
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post()
  create(@Body() dto: PlanDto) {
    return this.subscriptionsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<PlanDto>) {
    return this.subscriptionsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SCHOOL_ADMIN)
  @Post('upgrade')
  async upgrade(@Req() req: any, @Body() dto: { planId: string; amount: number }) {
    return this.paymentsService.initializePayment(
      req.user.id,
      'SUBSCRIPTION',
      dto.planId,
      dto.amount
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SCHOOL_ADMIN)
  @Post('schedule-downgrade')
  async scheduleDowngrade(@Req() req: any, @Body() dto: { planId: string }) {
    return this.subscriptionsService.scheduleDowngrade(req.user.id, dto.planId);
  }
}
