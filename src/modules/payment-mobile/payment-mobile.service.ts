import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { OrderService } from '../shopping/service/order.service';
import { OrderStatus } from '../shopping/entities/order.entity';

@Injectable()
export class PaymentMobileService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentMobileService.name);

  constructor(
    private configService: ConfigService,
    private orderService: OrderService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('❌ STRIPE_SECRET_KEY is missing in environment variables');
    }

    this.stripe = new Stripe(secretKey);
  }


async createCheckoutSession(
  amount: number | string,
  currency: string,
  productId: string,
  quantity: number,
  orderId: string,
): Promise<{ url: string }> {
  try {
    const cleanAmount = Number(String(amount).replace(/[.,]/g, ''));

    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      throw new Error(`Invalid VND amount: ${amount}`);
    }

    const stripeCurrency = 'vnd';

    const baseUrl = 'https://api.fresh-food.dev';

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: { name: `Product ${productId}` },
            unit_amount: cleanAmount,
          },
          quantity,
        },
      ],

      mode: 'payment',

      success_url: `${baseUrl}/payment-success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment-cancel?orderId=${orderId}`,
      metadata: { orderId, productId },
    });

    return { url: session.url! };

  } catch (error) {
    this.logger.error('❌ Error creating Stripe session:', error);
    throw new InternalServerErrorException('Failed to create checkout session');
  }
}

  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.orderId;
          if (orderId) {
            await this.orderService.updateStatus(orderId, OrderStatus.PAID);
            this.logger.log(`✅ Payment completed for order ${orderId}`);
          }
          break;
        }

        case 'checkout.session.expired':
        case 'payment_intent.canceled':
        case 'payment_intent.payment_failed': {
          const session = event.data.object as any;
          const orderId = session.metadata?.orderId;
          if (orderId) {
            await this.orderService.updateStatus(orderId, OrderStatus.CANCELED);
            this.logger.warn(`⚠️ Payment failed or canceled for order ${orderId}`);
          }
          break;
        }

        default:
          this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error('❌ Error handling Stripe webhook', error);
      throw new InternalServerErrorException('Failed to process Stripe webhook');
    }
  }

  getStripeInstance() {
    return this.stripe;
  }
}
