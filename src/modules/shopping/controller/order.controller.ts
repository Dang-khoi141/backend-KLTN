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
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';

type OrderStatusParam = 'PENDING' | 'PAID' | 'CANCELED';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @ResponseMessage('Order created successfully')
  create(@Body() dto: CheckoutDto) {
    return this.orderService.createOrderFromCart(dto.userId);
  }

  @Get('user/:userId')
  @ResponseMessage('User orders retrieved successfully')
  list(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.orderService.listUserOrders(userId);
  }

  @Patch(':orderId/status/:status')
  @ResponseMessage('Order status updated successfully')
  updateStatus(
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Param('status') status: OrderStatusParam,
  ) {
    return this.orderService.updateStatus(orderId, status);
  }
}
