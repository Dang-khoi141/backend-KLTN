import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentWebhookGuard } from './guards/payment-webhook.guard';
import type { PayosWebhookBodyPayload } from './dto/payos-webhook-body.payload';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @UseGuards(PaymentWebhookGuard)
  handleWebhook(@Body() body: PayosWebhookBodyPayload) {
    console.log('✅ PayOS webhook received:', body);
    return this.paymentService.handleWebhook();
  }
}
