import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initializePayment(userId: string, itemType: string, itemId: string, amount: number) {
    const reference = `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const payment = await this.prisma.payment.create({
      data: { userId, reference, amount, itemType, itemId },
    });
    
    // In a real app, we would call the Paystack API here to get an authorization URL.
    // We will simulate returning the reference for now.
    return {
      reference: payment.reference,
      amount: payment.amount,
      message: 'Payment initialized successfully. Complete via Paystack.',
    };
  }

  async handleWebhook(signature: string, body: any) {
    // Basic verification simulation. In production use your PAYSTACK_SECRET_KEY
    if (!signature) {
      throw new BadRequestException('Missing Paystack signature');
    }

    if (body.event === 'charge.success') {
      const reference = body.data.reference;
      await this.prisma.payment.update({
        where: { reference },
        data: { status: 'success' },
      });
      
      // We would also grant access to the itemType/itemId here...
    }
    
    return { received: true };
  }
}
