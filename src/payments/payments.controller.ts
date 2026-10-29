import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto, VerifyPaymentDto } from './dto';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('Payments')
@ApiBearerAuth()
@Auth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({ summary: 'Create a new payment intent for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @GetUser() user: User,
  ) {
    return this.paymentsService.createPaymentIntent(createPaymentIntentDto, user.id);
  }

  @Post('verify-payment')
  @ApiOperation({ summary: 'Verify payment status from Stripe and update order if successful' })
  @ApiResponse({ status: 200, description: 'Payment status verified successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  verifyPayment(
    @Body() verifyPaymentDto: VerifyPaymentDto,
    @GetUser() user: User,
  ) {
    return this.paymentsService.verifyPaymentStatus(verifyPaymentDto.paymentIntentId, user);
  }
}