import { Module } from '@nestjs/common';
import { ClassSessionsController } from './class-sessions.controller';
import { ClassSessionsService } from './class-sessions.service';

@Module({
  controllers: [ClassSessionsController],
  providers: [ClassSessionsService]
})
export class ClassSessionsModule {}
