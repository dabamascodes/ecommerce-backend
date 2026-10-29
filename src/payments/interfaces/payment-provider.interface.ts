export abstract class PaymentProvider {
  abstract createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, any>,
    customerEmail?: string,
    customerName?: string,
  ): Promise<{ clientSecret: string; paymentIntentId: string }>;

  abstract constructEventFromPayload(signature: string, payload: Buffer): any;
}