import { Controller, Post, Headers, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Handle incoming Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook successfully processed.' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request & { rawBody?: Buffer },
  ) {
    const rawBody = request.rawBody;

    if (!rawBody) {
      throw new Error('Webhook Error: Missing rawBody');
    }

    return this.paymentsService.handleStripeWebhook(signature, rawBody);
  }
}