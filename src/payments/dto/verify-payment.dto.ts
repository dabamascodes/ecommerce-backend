import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({ 
    description: 'The Stripe payment intent ID to verify',
    example: 'pi_3JVihKRYvAonxTbj1aWMEZo' 
  })
  @IsString()
  @IsNotEmpty()
  paymentIntentId!: string;
}