import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Shipping address UUID belonging to the user',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  shippingAddressId!: string;

  @ApiProperty({
    description: 'Optional discount amount applied to the order',
    example: 15.00,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Discount cannot be negative' })
  discount?: number;

  @ApiProperty({
    description: 'List of items included in the order',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}