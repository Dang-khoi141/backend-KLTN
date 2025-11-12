import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { Between, Repository, DeepPartial } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Users } from '../../user/entities/users.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Promotion } from '../../promotion/entities/promotion.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CartService } from './cart.service';
import { InventoryService } from '../../inventory/service/inventory.service';
import { IssueService } from '../../inventory/service/issue.service';
import { Warehouse } from '../../inventory/entities/warehouse.entity';

@Injectable()
export class OrderService {
  updateStripeSession(orderId: string, id: any) {
      throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    @InjectRepository(Promotion)
    private readonly promoRepo: Repository<Promotion>,
    @InjectRepository(Warehouse)
    private readonly whRepo: Repository<Warehouse>,
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
    private readonly issueService: IssueService,
  ) {}

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: ['user', 'items', 'items.product', 'promotion'],
      order: { createdAt: 'DESC' },
    });
  }

  async createOrderFromCart(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<Order> {
    const cart = await this.cartService.getOrCreateCart(userId);
    if (!cart.items?.length) throw new BadRequestException('Cart is empty');

    for (const item of cart.items) {
      const currentStock = await this.inventoryService.getStock(
        item.product.id,
      );

      if (currentStock <= 0) {
        throw new BadRequestException(
          `Product "${item.product.name}" is out of stock.`,
        );
      }

      if (currentStock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for product "${item.product.name}". Available: ${currentStock}, Requested: ${item.quantity}`,
        );
      }
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const orderNumber = this.generateOrderNumber();
    const order = this.orderRepo.create({
      user,
      orderNumber,
      status: OrderStatus.PENDING,
      total: 0,
      discountAmount: 0,
      items: [],
      paymentMethod: dto.paymentMethod || 'COD',
      shippingAddress: dto.shippingAddress,
      notes: dto.notes,
    } as DeepPartial<Order>);

    let total = 0;

    const orderItems = cart.items.map((i) => {
      const unitPrice = Number(i.unitPrice);
      total += unitPrice * i.quantity;
      return this.orderItemRepo.create({
        product: i.product,
        quantity: i.quantity,
        unitPrice,
      });
    });

    order.items = orderItems;

    let discountAmount = 0;
    let promotion: Promotion | null = null;

    if (dto.promotionCode) {
      promotion = await this.promoRepo.findOne({
        where: { code: dto.promotionCode, isActive: true },
      });

      if (!promotion) throw new BadRequestException('Invalid promotion code');

      const now = new Date();
      if (
        (promotion.startDate && now < promotion.startDate) ||
        (promotion.endDate && now > promotion.endDate)
      )
        throw new BadRequestException('Promotion code expired or inactive');

      if (promotion.minOrderValue && total < Number(promotion.minOrderValue))
        throw new BadRequestException(
          `Minimum order value for this promotion is ${promotion.minOrderValue}₫`,
        );

      if (promotion.discountPercent)
        discountAmount = Math.floor(
          (total * Number(promotion.discountPercent)) / 100,
        );
      else if (promotion.discountAmount)
        discountAmount = Number(promotion.discountAmount);

      total -= discountAmount;
      order.promotion = promotion;
    }

    order.discountAmount = discountAmount;
    order.total = Number(total.toFixed(2));

    const saved = await this.orderRepo.save(order);

    let warehouse = await this.whRepo.findOne({ where: {} });
    if (!warehouse) {
      warehouse = await this.whRepo.findOne({
        where: { name: 'Kho chính' as any },
      });
    }

    if (!warehouse) {
      throw new BadRequestException(
        'Không tìm thấy kho để xuất hàng. Vui lòng tạo ít nhất 1 kho trong hệ thống.',
      );
    }

    if ((dto.paymentMethod || 'COD') === 'COD') {
      try {
        await this.issueService.createIssue(
          {
            orderId: saved.id,
            warehouseId: warehouse.id,
            items: orderItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
          },
          userId,
        );
      } catch {
        throw new BadRequestException('Failed to create stock issue');
      }
    }

    await this.cartService.clear(userId);

    const result = await this.orderRepo.findOne({
      where: { id: saved.id },
      relations: ['items', 'items.product', 'promotion'],
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

  async getOrderDetailAdmin(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'user'],
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

    const prevStatus = order.status;
    order.status = status;

    if (status === OrderStatus.CANCELED) {
      const alreadyDeducted =
        order.paymentMethod === 'COD' || prevStatus === OrderStatus.PAID;

      if (alreadyDeducted) {
        for (const item of order.items) {
          await this.inventoryService.increaseStock(
            item.product.id,
            item.quantity,
          );
        }
      }
    }

    return this.orderRepo.save(order);
  }

  async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['items', 'items.product'],
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.PENDING)
      throw new BadRequestException('Can only cancel PENDING orders');

    order.status = OrderStatus.CANCELED;

    if (order.paymentMethod === 'COD') {
      for (const item of order.items) {
        await this.inventoryService.increaseStock(
          item.product.id,
          item.quantity,
        );
      }
    }

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

  async getStatistics(period: 'day' | 'week' | 'month' = 'week') {
    try {
      const now = dayjs();
      let startDate = now.startOf('week');

      if (period === 'day') startDate = now.startOf('day');
      else if (period === 'month') startDate = now.startOf('month');
      else if (period !== 'week')
        throw new BadRequestException('Invalid period value');

      if (!startDate.isValid() || !now.isValid())
        throw new BadRequestException('Invalid date range');

      const start = startDate.toDate();
      const end = now.toDate();

      const orders = await this.orderRepo.find({
        where: { createdAt: Between(start, end) },
      });

      const totalRevenue = orders.reduce(
        (sum, o) => sum + Number(o.total || 0),
        0,
      );
      const totalOrders = orders.length;
      const completedOrders = orders.filter(
        (o) =>
          o.status === OrderStatus.DELIVERED || o.status === OrderStatus.PAID,
      ).length;

      const days: Record<string, number> = {};
      const diffDays = period === 'month' ? now.diff(startDate, 'day') + 1 : 7;

      for (let i = 0; i < diffDays; i++) {
        const date = startDate.add(i, 'day').format('YYYY-MM-DD');
        days[date] = 0;
      }

      orders.forEach((order) => {
        const date = dayjs(order.createdAt).format('YYYY-MM-DD');
        if (days[date] !== undefined) days[date] += Number(order.total || 0);
      });

      const statusChart = orders.reduce(
        (acc, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        totalRevenue,
        totalOrders,
        completedOrders,
        chart: Object.entries(days).map(([date, revenue]) => ({
          date,
          revenue,
        })),
        statusChart,
      };
    } catch (error) {
      console.error('Error in getStatistics():', error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        completedOrders: 0,
        chart: [],
        statusChart: {},
      };
    }
  }
}
