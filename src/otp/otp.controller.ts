import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  async sendOtp(@Body('email') email: string) {
    const result = await this.otpService.sendOtp(email);
    return { message: 'OTP sent successfully', otp: result.otp };
  }
}
