import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { Order, OrderItem } from './entities';
import { Product } from '../products/entities/product.entity';
import { Address } from '../addresses/entities/address.entity';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from './enum/order-status.enum';

@Injectable()
export class OrdersService {
  private readonly TAX_RATE = 0.16;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User) {
    const { shippingAddressId, items, discount: requestedDiscount = 0 } = createOrderDto;

    const address = await this.addressRepository.findOne({
      where: { id: shippingAddressId, user: { id: user.id }, isActive: true },
    });

    if (!address) {
      throw new NotFoundException(`Shipping address with ID ${shippingAddressId} not found or does not belong to user`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotal = 0;
      const orderItemsToSave: OrderItem[] = [];

      for (const itemDto of items) {
        const product = await queryRunner.manager.findOneBy(Product, { id: itemDto.productId });

        if (!product) {
          throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);
        }

        if (!product.isActive) {
          throw new BadRequestException(`Product '${product.name}' is not active`);
        }

        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product '${product.name}'. Available: ${product.stock}, Requested: ${itemDto.quantity}`,
          );
        }

        product.stock -= itemDto.quantity;
        await queryRunner.manager.save(product);

        const itemSubtotal = Number(product.price) * itemDto.quantity;
        subtotal += itemSubtotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          quantity: itemDto.quantity,
          price: product.price,
          product,
        });

        orderItemsToSave.push(orderItem);
      }

      let discount = Number(requestedDiscount) || 0;
      if (discount > subtotal) {
        discount = subtotal;
      }

      const taxableAmount = subtotal - discount;
      const tax = Number((taxableAmount * this.TAX_RATE).toFixed(2));
      const total = Number((taxableAmount + tax).toFixed(2));

      const order = queryRunner.manager.create(Order, {
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        tax,
        total,
        status: OrderStatus.PENDING,
        user,
        shippingAddress: address,
        orderItems: orderItemsToSave,
      });

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByUser(user: User, limit: number = 10, offset: number = 0) {
    return await this.orderRepository.find({
      where: { user: { id: user.id } },
      take: limit,
      skip: offset,
      relations: {
        orderItems: {
          product: true,
        },
        shippingAddress: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllAdmin(limit: number = 10, offset: number = 0) {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .take(limit)
      .skip(offset)
      .orderBy('order.createdAt', 'DESC');

    const [orders, total] = await query.getManyAndCount();
    return {
      total,
      limit,
      offset,
      orders,
    };
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.findOneAdmin(id);
    order.status = updateOrderStatusDto.status;
    return await this.orderRepository.save(order);
  }

  async updatePaymentIntentId(id: string, paymentIntentId: string) {
    const order = await this.findOneAdmin(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot update payment intent for order ${id} because its status is '${order.status}'`,
      );
    }

    order.paymentIntentId = paymentIntentId;
    return await this.orderRepository.save(order);
  }

  async cancel(id: string, user: User) {
    const order = await this.findOne(id, user);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Order with status '${order.status}' cannot be cancelled`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      order.status = OrderStatus.CANCELLED;
      const savedOrder = await queryRunner.manager.save(order);

      for (const item of order.orderItems) {
        await queryRunner.manager.increment(
          Product,
          { id: item.product.id },
          'stock',
          item.quantity,
        );
      }

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string, user: User) {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: {
        orderItems: {
          product: true,
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findOneAdmin(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        orderItems: {
          product: true,
        },
        shippingAddress: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { paymentIntentId },
      relations: {
        orderItems: {
          product: true,
        },
        shippingAddress: true,
        user: true,
      },
    });
  }
}

