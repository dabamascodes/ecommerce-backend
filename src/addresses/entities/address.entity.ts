import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  street!: string;

  @Column('text')
  exteriorNumber!: string;

  @Column('text', { nullable: true })
  interiorNumber?: string;

  @Column('text')
  neighborhood!: string;

  @Column('text')
  city!: string;

  @Column('text')
  state!: string;

  @Column('text')
  zipCode!: string;

  @Column('text')
  country!: string;

  @Column('text')
  phone!: string;

  @Column('boolean', { default: true })
  isActive!: boolean;

  @Column('boolean', { default: false })
  isDefault!: boolean;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'RESTRICT' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
