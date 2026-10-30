import { Injectable } from '@nestjs/common';
import { UsersSeedService } from './services/users-seed.service';
import { ProductsSeedService } from './services/products-seed.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly usersSeedService: UsersSeedService,
    private readonly productsSeedService: ProductsSeedService,
  ) {}

  async runUsersSeed() {
    return await this.usersSeedService.seedUsers();
  }

  async runProductsSeed(filePath: string) {
    return await this.productsSeedService.seedProductsFromCsv(filePath);
  }
}