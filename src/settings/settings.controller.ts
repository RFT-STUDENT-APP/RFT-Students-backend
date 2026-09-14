import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('pricing/public')
  getPublicPricing() {
    return this.settingsService.getPricingSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get('pricing')
  getPricing() {
    return this.settingsService.getPricingSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Patch('pricing')
  updatePricing(@Body() dto: { courseMaterialPrice?: number; pastQuestionPrice?: number }) {
    return this.settingsService.updatePricingSettings(dto);
  }
}
