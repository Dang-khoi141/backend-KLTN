import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentWebhookGuard } from './guards/payment-webhook.guard';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ShoppingModule } from '../shopping/shopping.module';

@Module({
  imports: [HttpModule, ConfigModule, ShoppingModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentWebhookGuard],
  exports: [PaymentService],
})
export class PaymentModule {}
