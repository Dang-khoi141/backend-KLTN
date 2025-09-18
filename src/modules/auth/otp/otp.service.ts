import { Injectable, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../user/user.service';
import { ResetPasswordDto } from './entities/reset-password.dto';

@Injectable()
export class OtpService {
  private readonly emailTransporter;
  private otpStore = new Map<string, string>();

  constructor(private readonly userService: UserService) {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async sendOtpToEmail(email: string): Promise<string> {
    const otp = this.generateOtp();

    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is ${otp}`,
        html: `<p>Your OTP is <strong>${otp}</strong></p>`,
      });

      return otp;
    } catch (error) {
      console.error('Error sending OTP via email', error);
      throw new Error('Failed to send OTP via email');
    }
  }

  async sendOtp(email: string): Promise<{ message: string }> {
    const otp = await this.sendOtpToEmail(email);
    this.otpStore.set(email, otp);

    setTimeout(() => this.otpStore.delete(email), 5 * 60 * 1000);

    return { message: 'OTP sent successfully' };
  }

  verifyOtp(email: string, otp: string): boolean {
    const storedOtp = this.otpStore.get(email);
    return storedOtp === otp;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const isValid = this.verifyOtp(dto.email, dto.otp);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userService.updatePassword(dto.email, hashedPassword);

    this.otpStore.delete(dto.email);

    return { message: 'Password reset successfully' };
  }
}
