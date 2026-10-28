import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Product UUID to be added to the order',
    example: 'd3b07384-d113-4ec6-a579-1234567890ab',
  })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    description: 'Quantity of the product ordered',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  quantity!: number;
}