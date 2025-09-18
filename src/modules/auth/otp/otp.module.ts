import { Global, Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { UserModule } from '../../user/user.module';

@Global()
@Module({
  imports: [UserModule],
  providers: [OtpService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
