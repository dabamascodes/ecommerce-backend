import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'test1@google.com',
    format: 'email',
  })
  @IsString()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @ApiProperty({
    description: 'User password - Must have uppercase, lowercase and a number',
    example: 'Password123',
    minLength: 6,
    maxLength: 50,
    writeOnly: true,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50, { message: 'Password cannot exceed 50 characters' })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have an uppercase letter, a lowercase letter, and a number',
  })
  password!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Peter',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/, {
    message: 'Name must only contain valid alphabetic characters',
  })
  name!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Parker',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/, {
    message: 'Last name must only contain valid alphabetic characters',
  })
  lastName!: string;

  @ApiProperty({
    description: 'User primary phone number for contact and shipping logistics',
    example: '9151234567',
    minLength: 7,
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: 'Phone number must follow a valid format (e.g., 9151234567 or +526561234567)',
  })
  phone!: string;
}