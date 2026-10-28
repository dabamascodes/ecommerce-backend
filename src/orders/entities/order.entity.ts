import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../addresses/entities/address.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @ApiProperty({ example: 'b1c2d3e4-5678-90ab-cdef-1234567890ab', description: 'Order UUID' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 1200.00, description: 'Subtotal amount before taxes and discounts' })
  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @ApiProperty({ example: 0.00, description: 'Discount applied to the order' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount!: number;

  @ApiProperty({ example: 192.00, description: 'Tax amount applied (e.g., IVA)' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax!: number;

  @ApiProperty({ example: 1392.00, description: 'Final total amount of the order' })
  @Column('decimal', { precision: 10, scale: 2 })
  total!: number;

  @ApiProperty({ example: 'pending', description: 'Current status of the order' })
  @Column('varchar', { default: 'pending' })
  status!: string; // pending, paid, shipped, delivered, cancelled

  @ApiProperty({ example: 'pi_3Mtw12LkdJz1Zu', description: 'Payment Intent ID from gateway', required: false })
  @Column('varchar', { nullable: true })
  paymentIntentId!: string;

  @ManyToOne(() => User, (user) => user.orders, { eager: true, onDelete: 'RESTRICT' })
  user!: User;

  @ManyToOne(() => Address, { eager: true, onDelete: 'RESTRICT' })
  shippingAddress!: Address;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems!: OrderItem[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}