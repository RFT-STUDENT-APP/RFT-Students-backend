import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ForgotPasswordResetDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  otp!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^\S{8,}$/, {
    message: 'newPassword must be at least 8 characters and contain no spaces',
  })
  newPassword!: string;
}

