import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles.enum';
import { User } from './entities/user.entity';
import { UpdateUserDto, UpdateUserRoleDto } from './dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @Auth(ValidRoles.user)
  @ApiOperation({ summary: 'User: Get own profile details and addresses' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@GetUser() user: User) {
    return this.usersService.getUserProfile(user.id!);
  }

  @Patch('profile')
  @Auth(ValidRoles.user)
  @ApiOperation({ summary: 'User: Update own profile information (name, lastName, phone, password, etc.)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: User })
  @ApiResponse({ status: 400, description: 'Bad request (e.g., email already taken)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user.id!, updateUserDto);
  }

  @Get()
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Admin: Get all users in the system with their addresses' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully', type: [User] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin role required)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Admin: Get a specific user by UUID' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Auth(ValidRoles.superUser)
  @ApiOperation({ summary: 'Super-User: Update a user roles (e.g., promote user to admin)' })
  @ApiResponse({ status: 200, description: 'User roles updated successfully', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Super-user role required)' })
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, updateUserRoleDto);
  }

  @Patch(':id/deactivate')
  @Auth(ValidRoles.superUser)
  @ApiOperation({ summary: 'Super-User: Deactivate a user account (Set isActive to false)' })
  @ApiResponse({ status: 200, description: 'User successfully deactivated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Super-user role required)' })
  deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deactivateUser(id);
  }

  @Patch(':id/restore')
  @Auth(ValidRoles.superUser)
  @ApiOperation({ summary: 'Super-User: Restore a deactivated user account (Set isActive to true)' })
  @ApiResponse({ status: 200, description: 'User successfully restored', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Super-user role required)' })
  @ApiResponse({ status: 404, description: 'User not found' })
  restoreUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.restoreUser(id);
  }
}