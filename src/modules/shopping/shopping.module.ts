import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../catalog/entities/product.entity';
import { Users } from '../user/entities/users.entity';

import { OrderService } from './service/order.service';
import { CartService } from './service/cart.service';
import { CartController } from './controller/cart.controller';
import { OrderController } from './controller/order.controller';
import { Promotion } from '../promotion/entities/promotion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Order,
      OrderItem,
      Product,
      Users,
      Promotion,
    ]),
  ],
  providers: [CartService, OrderService],
  controllers: [CartController, OrderController],
  exports: [CartService, OrderService],
})
export class ShoppingModule {}
