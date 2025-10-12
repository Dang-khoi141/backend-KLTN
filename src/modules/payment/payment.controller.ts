import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentWebhookGuard } from './guards/payment-webhook.guard';
import type { PayosWebhookBodyPayload } from './dto/payos-webhook-body.payload';
import type { CreatePaymentDto } from './types/dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body() body: CreatePaymentDto): Promise<any> {
    return this.paymentService.createPayment(body);
  }

  @Post('webhook')
  @UseGuards(PaymentWebhookGuard)
  handleWebhook(@Body() body: PayosWebhookBodyPayload) {
    return this.paymentService.handleWebhook(body);
  }

  @Get('status/:orderCode')
  async checkStatus(@Param('orderCode', ParseIntPipe) orderCode: number) {
    return this.paymentService.checkPaymentStatus(orderCode);
  }
}
