import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PaymentProvider } from './interfaces/payment-provider.interface';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/enum/order-status.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PaymentProvider)
    private readonly paymentProvider: PaymentProvider,
    private readonly ordersService: OrdersService,
  ) {}

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto, userId: string) {
    const { orderId } = createPaymentIntentDto;

    const order = await this.ordersService.findOne(orderId, { id: userId } as any);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Order is not in PENDING status. Current status: ${order.status}`);
    }

    const amountInCents = Math.round(order.total * 100);
    const currency = 'usd';

    const paymentData = await this.paymentProvider.createPaymentIntent(
      amountInCents,
      currency,
      { orderId: order.id },
    );

    await this.ordersService.updatePaymentIntentId(order.id, paymentData.paymentIntentId);

    return {
      orderId: order.id,
      total: order.total,
      currency,
      ...paymentData,
    };
  }

  async verifyPaymentStatus(paymentIntentId: string, user: User) {
    console.log('>>> Buscando paymentIntentId recibido:', paymentIntentId);
    
    const order = await this.ordersService.findByPaymentIntentId(paymentIntentId);
    console.log('>>> Resultado de la búsqueda:', order);

    if (!order) {
      throw new NotFoundException(`No order found with paymentIntentId: ${paymentIntentId}`);
    }

    if (order.user && order.user.id !== user.id) {
      throw new ForbiddenException(`You can only verify and pay your own orders`);
    }

    await this.ordersService.updateStatus(order.id, { status: OrderStatus.PAID });

    return {
      success: true,
      message: `Order ${order.id} status updated to PAID`,
      paymentIntentId,
    };
  }

  async handleStripeWebhook(signature: string, payload: Buffer) {
    const event = this.paymentProvider.constructEventFromPayload(signature, payload);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      if (paymentIntentId) {
        const order = await this.ordersService.findByPaymentIntentId(paymentIntentId);

        if (order) {
          await this.ordersService.updateStatus(order.id, { status: OrderStatus.PAID });
          console.log(`[Webhook] Order ${order.id} successfully updated to PAID.`);
        }
      }
    }

    return { received: true };
  }
}