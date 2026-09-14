import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class RegisterLecturerDto {
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

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^\S{8,}$/, {
    message: 'password must be at least 8 characters and contain no spaces',
  })
  password!: string;

  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  courseIds?: string[];

  @IsOptional()
  @IsString()
  customCourse?: string;
}

