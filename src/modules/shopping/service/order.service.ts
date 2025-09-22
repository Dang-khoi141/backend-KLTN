import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Users } from '../../user/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { CartService } from './cart.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly cartService: CartService,
  ) {}

  async createOrderFromCart(userId: string): Promise<Order> {
    const cart = await this.cartService.getOrCreateCart(userId);
    if (!cart.items?.length) throw new BadRequestException('Cart is empty');

    const order = this.orderRepo.create({
      user: { id: userId } as Users,
      status: 'PENDING',
      total: 0,
      items: [],
    });

    let total = 0;
    order.items = cart.items.map((i) => {
      const unitPrice = Number(i.unitPrice ?? i.product.price);
      total += unitPrice * i.quantity;
      return this.orderItemRepo.create({
        product: i.product,
        quantity: i.quantity,
        unitPrice,
      });
    });
    order.total = Number(total.toFixed(2));

    const saved = await this.orderRepo.save(order);
    await this.cartService.clear(userId);

    const result = await this.orderRepo.findOne({ where: { id: saved.id } });
    if (!result) throw new NotFoundException('Order not found after save');
    return result;
  }

  async listUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    orderId: string,
    status: 'PENDING' | 'PAID' | 'CANCELED',
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepo.save(order);
  }
}
