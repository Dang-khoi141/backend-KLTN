import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentWebhookGuard } from './guards/payment-webhook.guard';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentWebhookGuard],
  exports: [PaymentService],
})
export class PaymentModule {}
