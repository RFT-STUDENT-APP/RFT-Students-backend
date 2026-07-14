import { EmailModule } from './email/email.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SchoolsModule } from './schools/schools.module';
import { FacultiesModule } from './faculties/faculties.module';
import { DepartmentsModule } from './departments/departments.module';
import { CoursesModule } from './courses/courses.module';
import { ContentModule } from './content/content.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { ClassRepsModule } from './class-reps/class-reps.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { ClassSessionsModule } from './class-sessions/class-sessions.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SupportModule } from './support/support.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [PrismaModule, AuthModule, EmailModule, SchoolsModule, FacultiesModule, DepartmentsModule, CoursesModule, ContentModule, AnnouncementsModule, ClassRepsModule, NotificationsModule, PaymentsModule, AssessmentsModule, ClassSessionsModule, AdmissionsModule, AnalyticsModule, SupportModule, FeedbackModule],
})
export class AppModule {}
