import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PayosRequestPaymentPayload } from './dto/payos-request-payment.payload';
import { generateSignature } from './payos-utils';
import { CreatePaymentDto } from './types/dto';
import { PayosWebhookBodyPayload } from './dto/payos-webhook-body.payload';
import { OrderService } from '../shopping/service/order.service';
import { OrderStatus } from '../shopping/entities/order.entity';

@Injectable()
export class PaymentService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
  ) {}

  async createPayment(body: CreatePaymentDto): Promise<any> {
    const url = `https://api-merchant.payos.vn/v2/payment-requests`;

    let totalAmount = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    if (body.discountAmount && body.discountAmount > 0) {
      totalAmount = Math.max(0, totalAmount - Number(body.discountAmount));
    }
    const shortOrderId = body.orderId.slice(-8);
    const desc = `DH-${shortOrderId}-${Date.now().toString().slice(-4)}`;
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';

    const orderCode = Number(
      `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`,
    );

    const dataForSignature = {
      orderCode,
      amount: totalAmount,
      description: desc,
      cancelUrl: `${frontendUrl}/payment/${body.orderId}?cancel=1`,
      returnUrl: `${frontendUrl}/payment/${body.orderId}`,
    };

    const signature = generateSignature(
      dataForSignature,
      this.configService.getOrThrow<string>('PAY_CHECKSUM_KEY'),
    );

    const payload: PayosRequestPaymentPayload = {
      ...dataForSignature,
      items: body.items,
      signature,
    };

    console.log('Payload gửi lên PayOS:', payload);

    const config = {
      headers: {
        'x-client-id': this.configService.getOrThrow<string>('PAY_CLIENT_ID'),
        'x-api-key': this.configService.getOrThrow<string>('API_KEY_PAY'),
      },
    };

    const response = await firstValueFrom(
      this.httpService.post(url, payload, config),
    );

    await this.orderService.updatePayosCode(body.orderId, orderCode);

    return {
      message: 'Tạo mã QR thanh toán thành công',
      totalAmount,
      orderId: body.orderId,
      payosResponse: response.data,
    };
  }

  async handleWebhook(body: PayosWebhookBodyPayload) {
    console.log('✅ PayOS webhook received:', JSON.stringify(body, null, 2));

    const payosCode = body.data.orderCode;
    const order = await this.orderService.findByPayosCode(payosCode);

    if (!order) {
      return { message: 'Order not found', received: true };
    }

    const isPaid =
      body.data.code === '00' &&
      body.data.desc?.toLowerCase().includes('success');

    if (isPaid && order.status !== OrderStatus.PAID) {
      await this.orderService.updateStatus(order.id, OrderStatus.PAID);
    }

    return { received: true };
  }

  async checkPaymentStatus(orderCode: number): Promise<any> {
    const url = `https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`;

    const config = {
      headers: {
        'x-client-id': this.configService.getOrThrow<string>('PAY_CLIENT_ID'),
        'x-api-key': this.configService.getOrThrow<string>('API_KEY_PAY'),
      },
    };

    try {
      const response = await firstValueFrom(this.httpService.get(url, config));
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }
}
