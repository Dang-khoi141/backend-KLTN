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
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Cart retrieved successfully')
  getMyCart(@CurrentUser('userId') userId: string) {
    return this.cartService.getOrCreateCart(userId);
  }

  @Post('add')
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Product added to cart successfully')
  add(@CurrentUser('userId') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.add(userId, dto);
  }

  @Patch('quantity')
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Cart quantity updated successfully')
  updateQty(@CurrentUser('userId') userId: string, @Body() dto: UpdateCartDto) {
    return this.cartService.updateQuantity(userId, dto);
  }

  @Delete('items/:productId')
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Cart item removed successfully')
  removeCartItem(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete('clear')
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Cart cleared successfully')
  async clearCart(@CurrentUser('userId') userId: string) {
    await this.cartService.clear(userId);
    return true;
  }
}
