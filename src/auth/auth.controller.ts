import { Controller, Post, Body, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: any) {
    return this.authService.registerStudent(dto);
  }

  @Post('register-lecturer')
  registerLecturer(@Body() dto: any) {
    return this.authService.registerLecturer(dto);
  }

  @Post('register-school')
  registerSchool(@Body() dto: any) {
    return this.authService.registerSchool(dto);
  }


  @Post('verify-otp')
  verifyOtp(@Body() dto: { email: string; otp: string }) {
    return this.authService.verifyOtp(dto);
  }

  @Post('resend-otp')
  resendOtp(@Body() dto: { email: string }) {
    return this.authService.resendOtp(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: { email: string; otp: string; newPassword: string }) {
    return this.authService.resetPassword(dto);
  }


  @Post('login')
  login(@Body() dto: any) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) {
    return this.authService.me(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: { level?: string; phone?: string; fullName?: string }) {
    return this.authService.updateProfile(req.user.userId || req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: any) {
    return this.authService.logout(req.user);
  }
}
