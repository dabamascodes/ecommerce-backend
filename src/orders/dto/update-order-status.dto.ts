import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../enum/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New status of the order',
    enum: OrderStatus,
    example: OrderStatus.PAID,
  })
  @IsEnum(OrderStatus, {
    message: `Valid status values are: ${Object.values(OrderStatus).join(', ')}`,
  })
  @IsNotEmpty()
  status!: OrderStatus;
}