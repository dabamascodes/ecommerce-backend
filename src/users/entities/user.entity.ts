import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Address } from '../../addresses/entities/address.entity';
import { Order } from 'src/orders/entities';

@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text', {
    unique: true,
  })
  email!: string;

  @Column('text', {
    select: false,
  })
  password!: string;

  @Column('text')
  name!: string;

  @Column('text')
  lastName!: string;

  @Column('text')
  phone!: string;

  @Column('bool', {
    default: true,
  })
  isActive!: boolean;

  @Column('text', {
    array: true,
    default: ['user']
  })
  roles!: string[];

  @OneToMany(() => Address, (address) => address.user)
  addresses!: Address[];

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email?.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }

}