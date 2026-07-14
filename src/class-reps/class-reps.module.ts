import { Module } from '@nestjs/common';
import { ClassRepsController } from './class-reps.controller';
import { ClassRepsService } from './class-reps.service';

@Module({
  controllers: [ClassRepsController],
  providers: [ClassRepsService]
})
export class ClassRepsModule {}
