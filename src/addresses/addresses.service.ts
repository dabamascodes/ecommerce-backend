import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto';
import { User } from '../users/entities/user.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles.enum';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto, user: User) {
    if (createAddressDto.isDefault) {
      await this.resetDefaultAddresses(user.id);
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      user,
    });

    return await this.addressRepository.save(address);
  }

  async findAllByUser(user: User) {
    return await this.addressRepository.find({
      where: { 
        user: { id: user.id }, 
        isActive: true 
      },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findAllByUserId(userId: string) {
    return await this.addressRepository.find({
      where: { 
        user: { id: userId }, 
        isActive: true 
      },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!address || !address.isActive) {
      throw new NotFoundException(`Address with ID "${id}" not found`);
    }

    if (address.user.id !== user.id && !user.roles.includes(ValidRoles.admin)) {
      throw new ForbiddenException('You do not have permission to access this address');
    }

    return address;
  }

  async update(id: string, updateAddressDto: UpdateAddressDto, user: User) {
    const address = await this.findOne(id, user);

    if (updateAddressDto.isDefault) {
      await this.resetDefaultAddresses(user.id);
    }

    Object.assign(address, updateAddressDto);
    return await this.addressRepository.save(address);
  }

  async remove(id: string, user: User) {
    const address = await this.findOne(id, user);
    
    address.isActive = false;
    address.isDefault = false;
    await this.addressRepository.save(address);

    return { message: `Address with ID "${id}" successfully deactivated` };
  }

  private async resetDefaultAddresses(userId: string) {
    await this.addressRepository.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false },
    );
  }
}