import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller({
  path: 'otp',
  version: '1',
})
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  async sendOtp(@Body('email') email: string) {
    const result = await this.otpService.sendOtp(email);
    return { message: 'OTP sent successfully', otp: result.otp };
  }

  @Post('verify')
  verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    const isValid = this.otpService.verifyOtp(email, otp);
    return { valid: isValid };
  }
}
