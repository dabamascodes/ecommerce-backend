import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import csvParser = require('csv-parser');
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';
import { CsvProductRow } from './../interfaces';
import { ProductMapper } from './../mappers/product.mapper';

@Injectable()
export class ProductsSeedService {
  private readonly logger = new Logger(ProductsSeedService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async seedProductsFromCsv(filePath: string): Promise<{ categoriesInserted: number; productsInserted: number }> {
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`CSV file not found at path: ${filePath}`);
    }

    try {
      const rows: CsvProductRow[] = await this.readCsv(filePath);
      this.logger.log(`Records read from CSV: ${rows.length}`);

      await this.productRepository.query(
        'TRUNCATE TABLE products, categories RESTART IDENTITY CASCADE;',
      );

      const categoryMap = await this.seedCategories(rows);
      const productsCount = await this.seedProducts(rows, categoryMap);

      this.logger.log(`Seeding completed successfully.`);
      return {
        categoriesInserted: categoryMap.size,
        productsInserted: productsCount,
      };
    } catch (error: any) {
      const err = error as any;
      this.logger.error(`Error during seeding process: ${err.message}`, err.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Seed execution failed: ${err.detail || err.message}`);
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Temporary file removed: ${filePath}`);
      }
    }
  }

  private readCsv(filePath: string): Promise<CsvProductRow[]> {
    return new Promise((resolve, reject) => {
      const results: CsvProductRow[] = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  private async seedCategories(rows: CsvProductRow[]): Promise<Map<string, Category>> {
    const uniqueCategoryNames = new Set<string>();

    rows.forEach((row, index) => {
      const mapped = ProductMapper.mapCsvRowToProduct(row, index);
      uniqueCategoryNames.add(mapped.categoryName);
    });

    const categoryMap = new Map<string, Category>();

    for (const name of uniqueCategoryNames) {
      const slug = ProductMapper.slugify(name);
      let category = await this.categoryRepository.findOne({ where: { slug } });

      if (!category) {
        category = this.categoryRepository.create({
          name,
          slug,
          description: `Official category for ${name}`,
        });
        await this.categoryRepository.save(category);
      }
      categoryMap.set(name, category);
    }

    return categoryMap;
  }

  private async seedProducts(rows: CsvProductRow[], categoryMap: Map<string, Category>): Promise<number> {
    let inserted = 0;

    for (let i = 0; i < rows.length; i++) {
      const mappedData = ProductMapper.mapCsvRowToProduct(rows[i], i);
      const category = categoryMap.get(mappedData.categoryName) || categoryMap.get('Uncategorized');

      let product = await this.productRepository.findOne({ 
        where: [{ sku: mappedData.sku }, { slug: mappedData.slug }] 
      });

      if (!product) {
        try {
          product = this.productRepository.create({
            name: mappedData.name,
            sku: mappedData.sku,
            slug: mappedData.slug,
            description: mappedData.description,
            price: mappedData.price,
            stock: mappedData.stock,
            weight_kg: mappedData.weight_kg,
            category: category || undefined,
          });
          await this.productRepository.save(product);
          inserted++;
        } catch (dbError: any) {
          const err = dbError as any;
          this.logger.warn(`Skipping duplicate or invalid product row ${i}: ${mappedData.name} (${err.message})`);
        }
      }
    }

    return inserted;
  }
}