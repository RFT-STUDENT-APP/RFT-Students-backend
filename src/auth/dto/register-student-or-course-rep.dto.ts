import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  Matches,
} from 'class-validator';

export class RegisterStudentOrCourseRepDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  // Required for both STUDENT and COURSE_REP
  @IsString()
  @IsNotEmpty()
  matricNo!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  // Basic security: no spaces; allow common characters.
  @Matches(/^\S{8,}$/, {
    message: 'password must be at least 8 characters and contain no spaces',
  })
  password!: string;

  // Expected payload: "student" or "class_rep"
  @IsString()
  @IsIn(['student', 'class_rep'])
  role!: 'student' | 'class_rep';

  // Optional for STUDENT (your example uses an empty string).
  // Production: use `schoolId` selected from `GET /universities`
  @IsOptional()
  @IsNumber()
  schoolId?: number;

  // Intermediate support: if you still send `schoolName`, we will validate it exists
  // (we will NOT auto-create).
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  schoolName?: string;

  // Required for COURSE_REP ("class_rep")
  @ValidateIf((o) => o.role === 'class_rep')
  @IsString()
  @IsNotEmpty()
  access_code!: string;
}

