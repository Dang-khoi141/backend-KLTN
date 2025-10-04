import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from '../service/inventory.service';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ResponseMessage('Inventory retrieved successfully')
  async getAll() {
    return this.inventoryService.getAllInventory();
  }

  @Get('low-stock')
  @ResponseMessage('Low stock products retrieved successfully')
  async getLowStock() {
    return this.inventoryService.getLowStockProducts();
  }

  @Get(':productId')
  @ResponseMessage('Product stock retrieved successfully')
  async getStock(@Param('productId') productId: string) {
    return this.inventoryService.getStock(productId);
  }
}
