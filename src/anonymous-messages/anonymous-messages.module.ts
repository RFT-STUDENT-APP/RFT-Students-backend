import { Module } from '@nestjs/common';
import { AnonymousMessagesService } from './anonymous-messages.service';
import { AnonymousMessagesController } from './anonymous-messages.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnonymousMessagesController],
  providers: [AnonymousMessagesService],
  exports: [AnonymousMessagesService],
})
export class AnonymousMessagesModule {}
