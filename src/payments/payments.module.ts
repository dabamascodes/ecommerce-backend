import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripePaymentService } from './providers/stripe-payment.service';
import { MockPaymentService } from './providers/mock-payment.service';
import { PaymentProvider } from './interfaces/payment-provider.interface';
import { OrdersModule } from '../orders/orders.module';
import { WebhookController } from './webhook.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule, 
    OrdersModule, 
    AuthModule,
  ],
  controllers: [PaymentsController, WebhookController],
  providers: [
    PaymentsService,
    StripePaymentService,
    MockPaymentService,
    {
      provide: PaymentProvider,
      useFactory: (
        configService: ConfigService,
        stripeService: StripePaymentService,
        mockService: MockPaymentService,
      ) => {
        const provider = configService.get<string>('PAYMENT_PROVIDER') || 'stripe';
        return provider === 'mock' ? mockService : stripeService;
      },
      inject: [ConfigService, StripePaymentService, MockPaymentService],
    },
  ],
})
export class PaymentsModule {}