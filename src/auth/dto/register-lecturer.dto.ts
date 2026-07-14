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

  // Optional, but if provided it must match the admin's school.
  @IsOptional()
  @IsString()
  schoolName?: string;
}

