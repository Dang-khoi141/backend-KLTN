import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from '../service/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartDto } from '../dto/update-cart.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getMyCart(@CurrentUser('userId') userId: string) {
    return this.cartService.getOrCreateCart(userId);
  }

  @Post('add')
  add(@CurrentUser('userId') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.add(userId, dto);
  }

  @Patch('quantity')
  updateQty(@CurrentUser('userId') userId: string, @Body() dto: UpdateCartDto) {
    return this.cartService.updateQuantity(userId, dto);
  }

  @Delete('items/:productId')
  removeCartItem(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete('clear')
  async clearCart(@CurrentUser('userId') userId: string) {
    await this.cartService.clear(userId);
    return { message: 'Cart cleared' };
  }
}
