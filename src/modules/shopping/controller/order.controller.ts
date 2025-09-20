import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CheckoutDto } from '../dto/checkout.dto';
import { OrderService } from '../service/order.service';

type OrderStatusParam = 'PENDING' | 'PAID' | 'CANCELED';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  create(@Body() dto: CheckoutDto) {
    return this.orderService.createOrderFromCart(dto.userId);
  }

  @Get('user/:userId')
  list(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.orderService.listUserOrders(userId);
  }

  @Patch(':orderId/status/:status')
  updateStatus(
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Param('status') status: OrderStatusParam,
  ) {
    return this.orderService.updateStatus(orderId, status);
  }
}
