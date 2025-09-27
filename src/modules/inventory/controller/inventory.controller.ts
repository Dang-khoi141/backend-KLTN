import { Controller, Get, Param } from '@nestjs/common';
import { InventoryService } from '../service/inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getAll() {
    return this.inventoryService.getAllInventory();
  }

  @Get('low-stock')
  async getLowStock() {
    return this.inventoryService.getLowStockProducts();
  }

  @Get(':productId')
  async getStock(@Param('productId') productId: string) {
    return this.inventoryService.getStock(productId);
  }
}
