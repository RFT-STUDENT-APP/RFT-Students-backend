import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class CreateSchoolAdminDto {
  @IsString()
  @IsNotEmpty()
  schoolName!: string;

  @IsString()
  @IsNotEmpty()
  courseRepAccessCode!: string;

  @IsString()
  @IsNotEmpty()
  adminFirstName!: string;

  @IsString()
  @IsNotEmpty()
  adminLastName!: string;

  @IsEmail()
  adminEmail!: string;

  @IsString()
  @IsNotEmpty()
  adminPhone!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^\S{8,}$/, {
    message: 'adminPassword must be at least 8 characters and contain no spaces',
  })
  adminPassword!: string;
}

