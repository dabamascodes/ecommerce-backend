import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {

  @ApiProperty({
    description: 'User email address',
    example: 'test1@google.com',
    format: 'email'
  })
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User password - Must have uppercase, lowercase and a number',
    example: 'Password123',
    minLength: 6,
    maxLength: 50,
    writeOnly: true
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(
      /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
      message: 'The password must have a Uppercase, lowercase letter and a number'
  })
  password?: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Peter',
    minLength: 1
  })
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Parker',
    minLength: 1
  })
  @IsString()
  @MinLength(1)
  lastName?: string;
}
