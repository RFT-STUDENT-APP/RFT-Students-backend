import { Module } from '@nestjs/common';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';
import { DepartmentsService } from '../departments/departments.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  controllers: [SchoolsController],
  providers: [SchoolsService, DepartmentsService],
})
export class SchoolsModule {}
