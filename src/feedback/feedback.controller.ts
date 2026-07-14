import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // Intentionally leaving this without a global guard so anonymous users could potentially submit 
  // (if allowed by business logic). We'll try to extract the user if the token exists.
  @Post()
  createFeedback(@Body() data: any, @Request() req: any) {
    const userId = req.user?.userId || null;
    return this.feedbackService.createFeedback(userId, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Get('admin')
  findAllFeedback() {
    return this.feedbackService.findAllFeedback();
  }
}
