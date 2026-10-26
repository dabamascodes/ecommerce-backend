import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto, UpdateUserRoleDto } from './dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { addresses: true },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const { password, ...toUpdate } = updateUserDto;

    const user = await this.findOne(userId);

    if (password) {
      user.password = bcrypt.hashSync(password, 10);
    }

    Object.assign(user, toUpdate);

    try {
      await this.userRepository.save(user);
      
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll() {
    return await this.userRepository.find({
      relations: { addresses: true },
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { addresses: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async updateRole(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    const user = await this.findOne(id);

    user.roles = updateUserRoleDto.roles;
    await this.userRepository.save(user);

    return user;
  }


  async deactivateUser(id: string) {
    const user = await this.findOne(id);
    
    user.isActive = false;
    await this.userRepository.save(user);

    return {
      message: `User with ID "${id}" has been deactivated successfully`,
      user,
    };
  }

  async restoreUser(id: string) {
    const user = await this.findOne(id);
    
    user.isActive = true;
    await this.userRepository.save(user);

    return {
      message: `User with ID "${id}" has been restored successfully`,
      user,
    };
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}