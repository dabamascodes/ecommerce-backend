import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', {
    length: 150,
    unique: true,
    comment: 'Product display name',
  })
  name!: string;

  @Column('varchar', {
    length: 200,
    unique: true,
    name: 'slug',
    comment: 'URL-friendly slug for the product',
  })
  slug!: string;

  @Column('text', {
    nullable: true,
    comment: 'Detailed product description',
  })
  description?: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Product price',
  })
  price!: number;

  @Column('int', {
    default: 0,
    comment: 'Available stock quantity',
  })
  stock!: number;

  @Column('float', {
    nullable: true,
    comment: 'Product weight in kilograms',
  })
  weight_kg?: number;

  @Column('varchar', {
    length: 100,
    unique: true,
    comment: 'Stock Keeping Unit code',
  })
  sku!: string;

  @Column('boolean', {
    default: true,
    comment: 'Indicates if the product is active or soft-deleted',
  })
  isActive!: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Timestamp when the product was created',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    comment: 'Timestamp when the product was last updated',
  })
  updatedAt!: Date;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' }) 
  category!: Category;
}