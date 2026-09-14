import { Controller, Post, Get, Body, Headers, UseGuards, Request, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initialize')
  initialize(@Body() data: any, @Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.paymentsService.initializePayment(
      userId,
      data.itemType,
      data.itemId,
      data.amount,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  verify(@Body('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mock-purchase')
  mockPurchase(@Body() data: { itemId: string; itemType: string; amount?: number }, @Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.paymentsService.mockPurchase(userId, data.itemType, data.itemId, data.amount || 500);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-unlocks')
  getMyUnlocks(@Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.paymentsService.getUserUnlocks(userId);
  }

  @Post('webhook')
  @HttpCode(200)
  webhook(@Headers('x-paystack-signature') signature: string, @Body() body: any) {
    return this.paymentsService.handleWebhook(signature, body);
  }
}
