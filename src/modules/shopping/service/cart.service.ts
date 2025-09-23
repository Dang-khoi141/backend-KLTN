import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Users } from '../../user/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../entities/cart.entity';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../../catalog/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly itemRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepo.create({
        user: { id: userId } as Users,
        items: [],
      });
      cart = await this.cartRepo.save(cart);
      cart.items = [];
    }
    return cart;
  }

  async add(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<Cart> {
    if (quantity <= 0) throw new BadRequestException('Quantity must be > 0');

    const cart = await this.getOrCreateCart(userId);
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.isActive === false)
      throw new BadRequestException('Product is inactive');

    let item = cart.items.find((i) => i.product.id === productId);
    if (item) {
      item.quantity += quantity;
      await this.itemRepo.save(item);
    } else {
      item = this.itemRepo.create({
        cart,
        product,
        quantity,
        unitPrice: Number(product.price),
      });
      await this.itemRepo.save(item);
    }
    return this.cartRepo.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    }) as Promise<Cart>;
  }

  async updateQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.product.id === productId);
    if (!item) throw new NotFoundException('Item not found in cart');

    if (quantity <= 0) {
      await this.itemRepo.delete({ id: item.id });
    } else {
      item.quantity = quantity;
      await this.itemRepo.save(item);
    }
    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.product.id === productId);
    if (item) await this.itemRepo.delete({ id: item.id });
    return this.getOrCreateCart(userId);
  }

  async clear(userId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    await this.itemRepo.delete({ cart: { id: cart.id } as any });
  }
}
