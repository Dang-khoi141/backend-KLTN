import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { OtpService } from './otp.service';
import { UserService } from '../../user/user.service';

@Controller({
  path: 'otp',
  version: '1',
})
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async sendOtp(@Body('email') email: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const result = await this.otpService.sendOtp(email);
    return { message: 'OTP sent successfully' };
  }

  @Post('verify')
  verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    const isValid = this.otpService.verifyOtp(email, otp);
    return { valid: isValid };
  }
}
