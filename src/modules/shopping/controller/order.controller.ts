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
  Query,
} from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderService } from '../service/order.service';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrderStatus } from '../entities/order.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { RolesGuard } from '../../auth/guards/roles.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ResponseMessage('All orders retrieved successfully')
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Post('create')
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Order created successfully')
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrderFromCart(userId, dto);
  }

  @Get('my-orders')
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('User orders retrieved successfully')
  listMyOrders(@CurrentUser('userId') userId: string) {
    return this.orderService.listUserOrders(userId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get('statistics')
  @ResponseMessage('Order statistics retrieved successfully')
  getStatistics(@Query('period') period: 'day' | 'week' | 'month' = 'week') {
    return this.orderService.getStatistics(period);
  }

  @Get(':orderId')
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Order retrieved successfully')
  async getOrderDetail(
    @CurrentUser('userId') userId: string,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    const order = await this.orderService.getOrderDetail(userId, orderId);
    return order;
  }

  @Get('admin/:orderId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ResponseMessage('Order retrieved successfully')
  async getOrderDetailAdmin(
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    return this.orderService.getOrderDetailAdmin(orderId);
  }

  @Patch(':orderId/status/:status')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
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
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Order canceled successfully')
  cancelOrder(
    @CurrentUser('userId') userId: string,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    return this.orderService.cancelOrder(userId, orderId);
  }
}
