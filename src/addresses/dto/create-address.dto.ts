import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    description: 'Street name',
    example: 'Columbia Avenue',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  street!: string;

  @ApiProperty({
    description: 'Exterior house or building number',
    example: '1540',
  })
  @IsString()
  exteriorNumber!: string;

  @ApiProperty({
    description: 'Interior apartment or office number (Optional)',
    example: 'Depto 3B',
    required: false,
  })
  @IsString()
  @IsOptional()
  interiorNumber?: string;

  @ApiProperty({
    description: 'Neighborhood or colony name',
    example: 'Shawyer Park',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  neighborhood!: string;

  @ApiProperty({
    description: 'City name',
    example: 'El Paso',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  city!: string;

  @ApiProperty({
    description: 'State or province name',
    example: 'Texas',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  state!: string;

  @ApiProperty({
    description: 'ZIP or postal code',
    example: '79904',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  zipCode!: string;

  @ApiProperty({
    description: 'Country name',
    example: 'United States',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  country!: string;

  @ApiProperty({
    description: 'Recipient phone number for shipping logistics',
    example: '9151234567',
    minLength: 7,
  })
  @IsString()
  @MinLength(7)
  phone!: string;

  @ApiProperty({
    description: 'Defines if this is the default shipping address for the user',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}