export abstract class PaymentProvider {
  abstract createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, any>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }>;

  abstract constructEventFromPayload(signature: string, payload: Buffer): any;
}