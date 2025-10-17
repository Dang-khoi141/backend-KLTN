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
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async createPayment(@Body() body: CreatePaymentDto): Promise<any> {
    return this.paymentService.createPayment(body);
  }

  @Post('webhook')
  @UseGuards(PaymentWebhookGuard)
  handleWebhook(@Body() body: PayosWebhookBodyPayload) {
    return this.paymentService.handleWebhook(body);
  }

  @Get('status/:orderCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async checkStatus(@Param('orderCode', ParseIntPipe) orderCode: number) {
    return this.paymentService.checkPaymentStatus(orderCode);
  }
}
