import { Controller, Post, Body, Headers, UseGuards, Request, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initialize')
  initialize(@Body() data: any, @Request() req: any) {
    return this.paymentsService.initializePayment(
      req.user.userId,
      data.itemType,
      data.itemId,
      data.amount,
    );
  }

  @Post('webhook')
  @HttpCode(200)
  webhook(@Headers('x-paystack-signature') signature: string, @Body() body: any) {
    // Paystack webhooks are unauthenticated by JWT, they rely on the signature header
    return this.paymentsService.handleWebhook(signature, body);
  }
}
