import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Address } from '../addresses/entities/address.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { UsersSeedService } from './services/users-seed.service';
import { ProductsSeedService } from './services/products-seed.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      Address,
      Product, 
      Category,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [SeedController],
  providers: [SeedService, UsersSeedService, ProductsSeedService],
})
export class SeedModule {}