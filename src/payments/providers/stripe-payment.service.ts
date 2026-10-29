import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentProvider } from '../interfaces/payment-provider.interface';

@Injectable()
export class StripePaymentService implements PaymentProvider {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripe = new Stripe(secretKey);
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, any>,
    customerEmail?: string,
    customerName?: string,
  ) {
    let customerId: string | undefined;

    if (customerEmail) {
      const existingCustomers = await this.stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const newCustomer = await this.stripe.customers.create({
          email: customerEmail,
          name: customerName || 'Valued Customer',
        });
        customerId = newCustomer.id;
      }
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      customer: customerId,
      receipt_email: customerEmail,
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret ?? '',
      paymentIntentId: paymentIntent.id,
    };
  }

  constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}