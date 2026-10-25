import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('text', {
    unique: true,
  })
  email?: string;

  @Column('text', {
    select: false,
  })
  password?: string;

  @Column('text')
  name?: string;

  @Column('text')
  lastName?: string;

  @Column('bool', {
    default: true,
  })
  isActive?: boolean;

  @Column('text', {
    array: true,
    default: ['user']
  })
  roles?: string[];

  // Nota: Aquí agregaremos las relaciones con UserAddresses y Orders conforme avancemos en esos módulos
  // @OneToMany(() => UserAddress, (userAddress) => userAddress.user)
  // addresses: UserAddress[];

  // @OneToMany(() => Order, (order) => order.user)
  // orders: Order[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email?.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}