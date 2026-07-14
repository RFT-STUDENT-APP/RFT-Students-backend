import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(userId: string, data: any) {
    return this.prisma.supportTicket.create({
      data: { ...data, userId },
    });
  }

  async findAllTickets() {
    return this.prisma.supportTicket.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTicketStatus(id: string, status: string) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status },
    });
  }
}
