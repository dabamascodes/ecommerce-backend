import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsInt, 
  Min, 
  MaxLength, 
  MinLength, 
  IsUUID 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'The display name of the product',
    example: 'Wireless Mechanical Keyboard',
    uniqueItems: true,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the product',
    example: 'RGB backlit mechanical keyboard with hot-swappable switches',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 89.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({
    description: 'Available inventory stock quantity',
    example: 25,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiPropertyOptional({
    description: 'Product weight in kilograms',
    example: 1.2,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight_kg?: number;

  @ApiProperty({
    description: 'Stock Keeping Unit (SKU) code',
    example: 'KB-WIR-001',
    uniqueItems: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku!: string;

  @ApiProperty({
    description: 'UUID of the category this product belongs to',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;
}