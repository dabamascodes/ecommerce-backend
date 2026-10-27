import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { PaginationDto } from 'src/common/dtos';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const slug = this.slugify(createCategoryDto.name);

      const existingCategory = await this.categoryRepository.findOne({
        where: [{ name: createCategoryDto.name }, { slug }],
      });

      if (existingCategory) {
        throw new ConflictException(`Category with name '${createCategoryDto.name}' or slug already exists.`);
      }

      const category = this.categoryRepository.create({
        ...createCategoryDto,
        slug,
      });

      return await this.categoryRepository.save(category);
    } catch (error: any) {
      const err = error as any;
      if (err instanceof ConflictException) throw err;
      this.logger.error(`Failed to create category: ${err.message}`, err.stack);
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<Category[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.categoryRepository.find({
      take: limit,
      skip: offset,
      where: { isActive: true } 
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found.`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const slug = this.slugify(updateCategoryDto.name);
      const existing = await this.categoryRepository.findOne({ where: { slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Category with slug '${slug}' already exists.`);
      }
      category.slug = slug;
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    
    category.isActive = false;
    await this.categoryRepository.save(category);
  }

  async restore(id: string) {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException(`Category with ID #${id} not found`);
    }

    category.isActive = true;
    return await this.categoryRepository.save(category);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}