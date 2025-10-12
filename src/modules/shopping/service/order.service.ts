import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Users } from '../../user/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { Repository, DeepPartial } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { CartService } from './cart.service';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly cartService: CartService,
  ) {}

  async createOrderFromCart(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<Order> {
    const cart = await this.cartService.getOrCreateCart(userId);
    if (!cart.items?.length) throw new BadRequestException('Cart is empty');

    const orderNumber = this.generateOrderNumber();

    const order = this.orderRepo.create({
      user: { id: userId } as Users,
      orderNumber,
      status: OrderStatus.PENDING,
      total: 0,
      items: [],
      paymentMethod: dto.paymentMethod || 'COD',
      shippingAddress: dto.shippingAddress,
      notes: dto.notes,
    } as DeepPartial<Order>);

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

    const result = await this.orderRepo.findOne({
      where: { id: saved.id },
      relations: ['items', 'items.product'],
    });
    if (!result) throw new NotFoundException('Order not found after save');
    return result;
  }

  async listUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderDetail(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['items', 'items.product'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'],
    });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepo.save(order);
  }

  async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['items', 'items.product'],
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Can only cancel orders with PENDING status',
      );
    }

    order.status = OrderStatus.CANCELED;
    return this.orderRepo.save(order);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }

  async updatePayosCode(orderId: string, payosCode: number) {
    await this.orderRepo.update(orderId, { payosOrderCode: payosCode });
  }

  async findByPayosCode(payosCode: number) {
    return this.orderRepo.findOne({ where: { payosOrderCode: payosCode } });
  }
}
