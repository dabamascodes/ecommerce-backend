import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles.enum';
import { Address } from './entities/address.entity';
import { PaginationDto } from 'src/common/dtos';

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
@Auth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shipping address for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Address successfully created', type: Address })
  @ApiResponse({ status: 400, description: 'Bad Request (validation errors)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createAddressDto: CreateAddressDto,
    @GetUser() user: User,
  ) {
    return this.addressesService.create(createAddressDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active shipping addresses for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user addresses retrieved successfully', type: [Address] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@GetUser() user: User) {
    return this.addressesService.findAllByUser(user);
  }

  @Get('user/:userId')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Admin: Get all active addresses of a specific user by userId with pagination' })
  @ApiResponse({ status: 200, description: 'List of user addresses retrieved successfully', type: [Address] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin role required)' })
  findAllByAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.addressesService.findAllByUserId(userId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific address by its UUID' })
  @ApiResponse({ status: 200, description: 'Address found', type: Address })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (not owner or admin)' })
  @ApiResponse({ status: 404, description: 'Address not found or inactive' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.addressesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing address by its UUID' })
  @ApiResponse({ status: 200, description: 'Address successfully updated', type: Address })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @GetUser() user: User,
  ) {
    return this.addressesService.update(id, updateAddressDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete (deactivate) an address by its UUID' })
  @ApiResponse({ status: 200, description: 'Address successfully deactivated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.addressesService.remove(id, user);
  }
}