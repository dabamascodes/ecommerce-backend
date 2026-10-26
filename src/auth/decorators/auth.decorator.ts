import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
    ApiBearerAuth(),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
  );
}