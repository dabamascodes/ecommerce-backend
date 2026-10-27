import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Category } from '../categories/entities/category.entity';
import { PaginationDto } from 'src/common/dtos';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, name, ...productDetails } = createProductDto;

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, isActive: true },
    });

    if (!category) {
      throw new NotFoundException(`Active category with ID #${categoryId} not found`);
    }

    const slug = this.generateSlug(name);

    try {
      const product = this.productRepository.create({
        ...productDetails,
        name,
        slug,
        category,
      });

      return await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<Product[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.productRepository.find({
      take: limit,
      skip: offset,
      where: { isActive: true },
      relations: { category: true },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
      relations: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID #${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const { categoryId, name, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID #${id} not found`);
    }

    if (name) {
      product.name = name;
      product.slug = this.generateSlug(name);
    }

    if (categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId, isActive: true },
      });

      if (!category) {
        throw new NotFoundException(`Active category with ID #${categoryId} not found`);
      }

      product.category = category;
    }

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productRepository.save(product);

    return { message: `Product with ID #${id} deactivated successfully` };
  }

  async restore(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID #${id} not found`);
    }

    product.isActive = true;
    return await this.productRepository.save(product);
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new ConflictException(error.detail);
    }
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}