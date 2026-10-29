import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '../interfaces/payment-provider.interface';

@Injectable()
export class MockPaymentService implements PaymentProvider {
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, any>,
    customerEmail?: string,
    customerName?: string,
  ) {
    const paymentIntentId = `pi_mock_${Date.now()}`;
    const clientSecret = `${paymentIntentId}_secret_mock`;

    console.log(`[MOCK PAYMENT] PaymentIntent created for Order ID: ${metadata.orderId}, Amount: ${amount} ${currency}`);

    return {
      clientSecret,
      paymentIntentId,
    };
  }

  constructEventFromPayload(signature: string, payload: Buffer) {
    return JSON.parse(payload.toString());
  }
}