import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderService } from '../service/order.service';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrderStatus } from '../entities/order.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @ResponseMessage('Order created successfully')
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrderFromCart(userId, dto);
  }

  @Get('my-orders')
  @ResponseMessage('User orders retrieved successfully')
  listMyOrders(@CurrentUser('userId') userId: string) {
    return this.orderService.listUserOrders(userId);
  }

  @Get(':orderId')
  @ResponseMessage('Order retrieved successfully')
  async getOrderDetail(
    @CurrentUser('userId') userId: string,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    const order = await this.orderService.getOrderDetail(userId, orderId);
    return order;
  }

  @Patch(':orderId/status/:status')
  @ResponseMessage('Order status updated successfully')
  updateStatus(
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Param('status') status: string,
  ) {
    const upper = status.toUpperCase();
    if (!(upper in OrderStatus))
      throw new BadRequestException(`Invalid status: ${status}`);
    return this.orderService.updateStatus(
      orderId,
      OrderStatus[upper as keyof typeof OrderStatus],
    );
  }

  @Patch(':orderId/cancel')
  @ResponseMessage('Order canceled successfully')
  cancelOrder(
    @CurrentUser('userId') userId: string,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    return this.orderService.cancelOrder(userId, orderId);
  }
}
