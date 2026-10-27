import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', {
    length: 100,
    unique: true,
    comment: 'Unique display name of the category',
  })
  name!: string;

  @Column('varchar', {
    length: 150,
    unique: true,
    comment: 'URL-friendly slug generated from the category name',
  })
  slug!: string;

  @Column('text', {
    nullable: true,
    comment: 'Optional description for the category',
  })
  description?: string;

  @Column('boolean', {
    default: true,
    comment: 'Indicates if the category is active or soft-deleted',
  })
  isActive!: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Timestamp when the category was created',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    comment: 'Timestamp when the category was last updated',
  })
  updatedAt!: Date;

  @OneToMany(() => Product, (product) => product.category, {
    cascade: true,
  })
  products?: Product[];
}