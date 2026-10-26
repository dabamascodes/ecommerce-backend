import { ApiProperty } from '@nestjs/swagger';
import { 
  IsBoolean, 
  IsOptional, 
  IsString, 
  MaxLength, 
  MinLength, 
  Matches 
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    description: 'Street name',
    example: 'Columbia Avenue',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Street must be at least 3 characters long' })
  @MaxLength(100)
  street!: string;

  @ApiProperty({
    description: 'Exterior house or building number',
    example: '1540',
  })
  @IsString()
  @MinLength(1, { message: 'Exterior number is required' })
  @MaxLength(10, { message: 'Exterior number cannot exceed 10 characters' })
  @Matches(/^[a-zA-Z0-9#\-\s]+$/, {
    message: 'Exterior number must contain only valid alphanumeric characters',
  })
  exteriorNumber!: string;

  @ApiProperty({
    description: 'Interior apartment or office number (Optional)',
    example: 'Depto 3B',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Interior number cannot exceed 20 characters' })
  @Matches(/^[a-zA-Z0-9#\-\s]+$/, {
    message: 'Interior number must contain only valid alphanumeric characters',
  })
  interiorNumber?: string;

  @ApiProperty({
    description: 'Neighborhood or colony name',
    example: 'Shawyer Park',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'Neighborhood must be at least 2 characters long' })
  @MaxLength(50)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.-]+$/, {
    message: 'Neighborhood must contain only valid characters',
  })
  neighborhood!: string;

  @ApiProperty({
    description: 'City name',
    example: 'El Paso',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'City must be at least 2 characters long' })
  @MaxLength(50)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/, {
    message: 'City must only contain valid alphabetic characters',
  })
  city!: string;

  @ApiProperty({
    description: 'State or province name',
    example: 'Texas',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'State must be at least 2 characters long' })
  @MaxLength(50)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/, {
    message: 'State must only contain valid alphabetic characters',
  })
  state!: string;

  @ApiProperty({
    description: 'ZIP or postal code',
    example: '79904',
    minLength: 3,
  })
  @IsString()
  @Matches(/^\d{5}$/, {
    message: 'ZIP code must contain exactly 5 numeric digits',
  })
  zipCode!: string;

  @ApiProperty({
    description: 'Country name',
    example: 'United States',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'Country must be at least 2 characters long' })
  @MaxLength(50)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/, {
    message: 'Country must only contain valid alphabetic characters',
  })
  country!: string;

  @ApiProperty({
    description: 'Recipient phone number for shipping logistics',
    example: '9151234567',
    minLength: 7,
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: 'Phone number must follow a valid format (e.g., 9151234567 or +526561234567)',
  })
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