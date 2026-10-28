import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import {  } from './dto/update-order-status.dto';
import { Order } from './entities/order.entity';
import { Auth, GetUser } from '../auth/decorators'; 
import { RoleProtected } from '../auth/decorators/role-protected.decorator';

import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { OrderStatus } from './enum/order-status.enum';
import { UserRoleGuard } from 'src/auth/guards/user-role/user-role.guard';
import { ValidRoles } from 'src/auth/interfaces';

@ApiTags('Orders')
@ApiBearerAuth()
@Auth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: Order })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders belonging to the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user orders', type: [Order] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query() paginationDto: PaginationDto,
    @GetUser() user: User,
  ) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.ordersService.findAllByUser(user, limit, offset);
  }

  @Get('admin/all')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(UserRoleGuard)
  @ApiOperation({ summary: 'Admin: Get all orders across the entire platform' })
  @ApiResponse({ status: 200, description: 'List of all platform orders' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  findAllAdmin(
    @Query() paginationDto: PaginationDto,
  ) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.ordersService.findAllAdmin(limit, offset);
  }

  @Patch(':id/status')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(UserRoleGuard)
  @ApiOperation({ summary: 'Admin: Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully', type: Order })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific order by ID for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Order details', type: Order })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order by the authenticated user' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully', type: Order })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.ordersService.cancel(id, user);
  }
  
}