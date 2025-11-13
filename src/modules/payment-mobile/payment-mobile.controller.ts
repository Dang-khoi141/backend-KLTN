import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  Res,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaymentMobileService } from './payment-mobile.service';
import Stripe from 'stripe';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('payment-mobile')
export class PaymentMobileController {
  constructor(
    private readonly paymentMobileService: PaymentMobileService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create-session')
  async createSession(
    @Body()
    body: {
      amount: number;
      currency: string;
      productId: string;
      quantity: number;
      orderId: string;
    },
  ) {
    return this.paymentMobileService.createCheckoutSession(
      body.amount,
      body.currency,
      body.productId,
      body.quantity,
      body.orderId,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new InternalServerErrorException('Missing STRIPE_WEBHOOK_SECRET environment variable');
    }

    const stripe = this.paymentMobileService.getStripeInstance();

    let event: Stripe.Event;

    try {
      const payload = (req as any).body as Buffer;

      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      console.error('⚠️ Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await this.paymentMobileService.handleWebhook(event);
      return res.json({ received: true });
    } catch (err: any) {
      console.error('⚠️ Error processing webhook event:', err.message);
      return res.status(500).json({ error: 'Webhook handling failed' });
    }
  }
}
