import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY') || 're_mock_key';
    this.resend = new Resend(apiKey);
    this.defaultFrom = this.configService.get<string>('EMAIL_FROM') || 'noreply@rft-student.edu';
  }

  async sendOtpEmail(to: string, otp: string, purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD'): Promise<void> {
    const subject = purpose === 'VERIFY_EMAIL' ? 'Verify your email address' : 'Reset your password';
    const text = `Your OTP code is ${otp}. It will expire in 10 minutes.`;

    try {
      if (this.configService.get<string>('NODE_ENV') !== 'test') {
         await this.resend.emails.send({
          from: this.defaultFrom,
          to,
          subject,
          text,
        });
        console.log(`[EmailService] Sent OTP to ${to} for ${purpose}`);
      } else {
        console.log(`[EmailService - MOCK] OTP for ${to} is ${otp}`);
      }
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      // Depending on your requirements, you could throw the error or just log it
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject: 'Welcome to RFT Student Platform!',
        text: `Hi ${name},\n\nWelcome to the platform! We're glad to have you here.`,
      });
      console.log(`[EmailService] Sent welcome email to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  }
}
