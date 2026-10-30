import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Address } from '../../addresses/entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { SeedUser } from './../interfaces';
import rawUsersData from '../data/users-seed.data.json';

@Injectable()
export class UsersSeedService {
  private readonly logger = new Logger(UsersSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async seedUsers() {
    await this.userRepository.query('TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;');
    await this.userRepository.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE;');
    await this.addressRepository.query('TRUNCATE TABLE addresses RESTART IDENTITY CASCADE;');
    await this.userRepository.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');

    this.logger.warn('Orders, OrderItems, Addresses, and Users tables truncated.');

    const rawUsers: SeedUser[] = rawUsersData as SeedUser[];
    let insertedCount = 0;

    for (const rawUser of rawUsers) {
      const hashedPassword = await bcrypt.hash(rawUser.password, 10);

      const user = this.userRepository.create({
        name: rawUser.name,
        lastName: rawUser.lastName,
        email: rawUser.email,
        password: hashedPassword,
        phone: rawUser.phone,
        roles: rawUser.roles,
        isActive: rawUser.isActive,
      });

      const savedUser = await this.userRepository.save(user);

      if (rawUser.addresses && rawUser.addresses.length > 0) {
        const addressesToCreate = rawUser.addresses.map((addr) =>
          this.addressRepository.create({
            street: addr.street,
            exteriorNumber: addr.exteriorNumber,
            interiorNumber: addr.interiorNumber,
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            country: addr.country,
            phone: addr.phone,
            isDefault: addr.isDefault,
            user: savedUser,
          }),
        );

        await this.addressRepository.save(addressesToCreate);
      }

      insertedCount++;
    }

    this.logger.log(`User seeding completed: ${insertedCount} users with addresses inserted.`);
    return {
      usersInserted: insertedCount,
    };
  }
}