import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class OtpService {
  private readonly emailTransporter;

  constructor() {
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
    const otp = randomInt(100000, 999999).toString();
    return otp;
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

  async sendOtp(email: string): Promise<{ otp: string }> {
    const otp = await this.sendOtpToEmail(email);

    return { otp };
  }
}
