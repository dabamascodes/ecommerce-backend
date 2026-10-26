import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { ValidRoles } from '../../auth/interfaces/valid-roles.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'Array of roles assigned to the user',
    example: ['user', 'admin'],
    enum: ValidRoles,
    isArray: true,
  })
  @IsArray()
  @IsEnum(ValidRoles, { each: true })
  roles!: ValidRoles[];
}