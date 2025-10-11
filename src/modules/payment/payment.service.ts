import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PayosRequestPaymentPayload } from './dto/payos-request-payment.payload';
import { generateSignature } from './payos-utils';
import { CreatePaymentDto } from './types/dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async createPayment(body: CreatePaymentDto): Promise<any> {
    const url = `https://api-merchant.payos.vn/v2/payment-requests`;

    const totalAmount = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const dataForSignature = {
      orderCode: Number(
        `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`,
      ),
      amount: totalAmount,
      description: body.description,
      cancelUrl: 'https://example.com/cancel',
      returnUrl: 'https://example.com/return',
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

    const config = {
      headers: {
        'x-client-id': this.configService.getOrThrow<string>('PAY_CLIENT_ID'),
        'x-api-key': this.configService.getOrThrow<string>('API_KEY_PAY'),
      },
    };

    const response = await firstValueFrom(
      this.httpService.post(url, payload, config),
    );

    return {
      message: 'Tạo mã QR thanh toán thành công',
      totalAmount,
      payosResponse: response.data,
    };
  }

  handleWebhook() {
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
