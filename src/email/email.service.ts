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
        const res = await this.resend.emails.send({
          from: this.defaultFrom,
          to,
          subject,
          text,
        });
        if (res.error) {
          console.error(`[EmailService] Resend API error sending OTP to ${to}:`, res.error);
        } else {
          console.log(`[EmailService] Sent OTP to ${to} for ${purpose} (ID: ${res.data?.id})`);
        }
      } else {
        console.log(`[EmailService - MOCK] OTP for ${to} is ${otp}`);
      }
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      const res = await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject: 'Welcome to RFT Student Platform!',
        text: `Hi ${name},\n\nWelcome to the platform! We're glad to have you here.`,
      });
      if (res.error) {
        console.error(`[EmailService] Resend API error sending welcome to ${to}:`, res.error);
      } else {
        console.log(`[EmailService] Sent welcome email to ${to} (ID: ${res.data?.id})`);
      }
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  }

  async sendRoleCredentialsEmail(to: string, name: string, tempPassword: string, roleName: string, schoolName?: string): Promise<void> {
    const subject = `Welcome to RFT - Your ${roleName} Credentials`;
    const text = `Hello ${name},\n\n` +
      `You have been onboarded as a ${roleName} on the RFT Academic Platform${schoolName ? ` for ${schoolName}` : ''}.\n\n` +
      `Below are your login credentials:\n` +
      `Email: ${to}\n` +
      `Temporary Password: ${tempPassword}\n\n` +
      `Please log in to your account and update your password after signing in.\n\n` +
      `Best regards,\n` +
      `RFT Academic Administration`;

    try {
      if (this.configService.get<string>('NODE_ENV') !== 'test') {
        const res = await this.resend.emails.send({
          from: this.defaultFrom,
          to,
          subject,
          text,
        });
        if (res.error) {
          console.error(`[EmailService] Resend API error sending ${roleName} credentials to ${to}:`, res.error);
        } else {
          console.log(`[EmailService] Sent ${roleName} credentials email to ${to} (ID: ${res.data?.id})`);
        }
      } else {
        console.log(`[EmailService - MOCK] ${roleName} credentials for ${to}: password is ${tempPassword}`);
      }
    } catch (error) {
      console.error(`Failed to send lecturer credentials email to ${to}:`, error);
    }
  }

  async sendCapacityWarningEmail(schoolAdminEmail: string, platformAdminEmail: string, schoolName: string, currentCount: number, maxCount: number): Promise<void> {
    const subject = `[Action Required] Student Capacity Warning for ${schoolName}`;
    const text = `Hello,\n\n` +
      `This is an automated notification from the RFT Platform.\n\n` +
      `The institution "${schoolName}" is approaching its maximum student capacity limit.\n` +
      `Current Enrolled Students: ${currentCount}\n` +
      `Maximum Allowed Capacity: ${maxCount}\n\n` +
      `Please consider upgrading your subscription plan to ensure uninterrupted onboarding of new students.\n\n` +
      `Best regards,\n` +
      `RFT Platform System`;

    try {
      if (this.configService.get<string>('NODE_ENV') !== 'test') {
        await this.resend.emails.send({
          from: this.defaultFrom,
          to: [schoolAdminEmail, platformAdminEmail],
          subject,
          text,
        });
        console.log(`[EmailService] Sent capacity warning for ${schoolName}`);
      }
    } catch (error) {
      console.error(`Failed to send capacity warning email for ${schoolName}:`, error);
    }
  }

  async sendCapacityReachedEmail(schoolAdminEmail: string, platformAdminEmail: string, schoolName: string, maxCount: number): Promise<void> {
    const subject = `[URGENT] Student Capacity Reached for ${schoolName}`;
    const text = `Hello,\n\n` +
      `This is an automated notification from the RFT Platform.\n\n` +
      `The institution "${schoolName}" has reached its maximum student capacity limit (${maxCount} students).\n` +
      `Further student registrations have been temporarily paused.\n\n` +
      `Please upgrade your subscription plan immediately in the billing dashboard to restore student onboarding, or contact platform support if this is an error.\n\n` +
      `Best regards,\n` +
      `RFT Platform System`;

    try {
      if (this.configService.get<string>('NODE_ENV') !== 'test') {
        await this.resend.emails.send({
          from: this.defaultFrom,
          to: [schoolAdminEmail, platformAdminEmail],
          subject,
          text,
        });
        console.log(`[EmailService] Sent capacity reached alert for ${schoolName}`);
      }
    } catch (error) {
      console.error(`Failed to send capacity reached email for ${schoolName}:`, error);
    }
  }
}


