import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { Auth, GetUser } from './decorators';
import { CreateUserDto, LoginUserDto } from 'src/users/dto';
import { User } from 'src/users/entities/user.entity';
import { ValidRoles } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user', 
    description: 'Creates a new user account with the provided credentials. Returns user data and JWT token.' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Email already exists or invalid data' 
  })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login user', 
    description: 'Authenticates a user with email and password. Returns user data and JWT token.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged in' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid credentials' 
  })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  @ApiOperation({ 
    summary: 'Check authentication status', 
    description: 'Validates the current JWT token and returns updated user data with a new token.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token is valid - Returns user data and new token' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or expired token' 
  })
  @ApiBearerAuth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('admin-control')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  @ApiOperation({ 
    summary: 'Admin control route', 
    description: 'General control endpoint restricted to admin and super-user roles.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Control access granted' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions' 
  })
  @ApiBearerAuth()
  adminControl(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      message: 'Admin control access granted',
      user,
    };
  }
}