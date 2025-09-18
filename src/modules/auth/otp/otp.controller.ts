import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { OtpService } from './otp.service';
import { UserService } from '../../user/user.service';
import { ResetPasswordDto } from './entities/reset-password.dto';
import { OtpVerifyDto } from './entities/otp-verify.dto';
import { OtpSendDto } from './entities/otp-send.dto';

@Controller({
  path: 'otp',
  version: '1',
})
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async sendRegisterOtp(@Body() dto: OtpSendDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    await this.otpService.sendOtp(dto.email);
    return { message: 'OTP sent successfully for register' };
  }

  @Post('forgot')
  async sendForgotOtp(@Body() dto: OtpSendDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (!existingUser) {
      throw new BadRequestException('Email not found');
    }

    await this.otpService.sendOtp(dto.email);
    return { message: 'OTP sent successfully for password reset' };
  }

  @Post('verify')
  verifyOtp(@Body() dto: OtpVerifyDto) {
    const isValid = this.otpService.verifyOtp(dto.email, dto.otp);
    return { valid: isValid };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.otpService.resetPassword(dto);
  }
}
