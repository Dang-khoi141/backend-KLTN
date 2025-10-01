import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { AddToCartDto } from '../dto/add-to-cart.dto';
import { CartService } from '../service/cart.service';
import { UpdateCartDto } from '../dto/update-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // =========  start:owner  ========= //
  @Get()
  getMyCart() {}

  @Post('add')
  add(@Body() dto: AddToCartDto) {
    return this.cartService.add(dto);
  }

  @Patch('quantity')
  updateQty(@Body() dto: UpdateCartDto) {
    return this.cartService.updateQuantity(dto);
  }

  @Delete('items/:itemId')
  removeCartItem() {}

  @Delete('clear')
  clearCart() {}
  // =========  end:owner  ========= //

  // =========  start:admin  ========= //
  // =========  end:admin  ========= //

  // @Get(':userId')
  // getCart(@Param('userId', new ParseUUIDPipe()) userId: string) {
  //   return this.cartService.getOrCreateCart(userId);
  // }

  // @Post('add')
  // add(@Body() dto: AddToCartDto) {
  //   return this.cartService.add(dto.userId, dto.productId, dto.quantity);
  // }

  // @Put('quantity')
  // updateQty(@Body() dto: UpdateQtyDto) {
  //   return this.cartService.updateQuantity(
  //     dto.userId,
  //     dto.productId,
  //     dto.quantity,
  //   );
  // }

  // @Delete(':userId/item/:productId')
  // removeItem(
  //   @Param('userId', new ParseUUIDPipe()) userId: string,
  //   @Param('productId', new ParseUUIDPipe()) productId: string,
  // ) {
  //   return this.cartService.removeItem(userId, productId);
  // }

  // @Delete(':userId/clear')
  // @HttpCode(204)
  // async clear(@Param('userId', new ParseUUIDPipe()) userId: string) {
  //   await this.cartService.clear(userId);
  // }
}
